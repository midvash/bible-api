/**
 * Catálogo de versões bíblicas — carregado do R2 (`catalog/versions.json`).
 *
 * Antes este módulo re-exportava de `@midvash/data` (pacote interno do
 * monorepo Midvash). A API pública agora é standalone: o monorepo publica o
 * catálogo serializado no R2 (via `scripts/publish-bible-catalog.ts`) e a API
 * apenas lê. A fonte de verdade continua no monorepo; aqui é estritamente
 * leitura — coerente com o resto do worker, onde "toda fonte é R2".
 *
 * O binding R2 só existe dentro do `fetch` handler, então o catálogo é
 * carregado lazy no primeiro request e memoizado por isolate. Ele muda
 * raramente (só quando uma versão nova é adicionada); cada novo deploy do
 * monorepo republica o JSON e os isolates renovam naturalmente ao reciclar.
 */

import type { Env } from './env';
import { closestString } from './lib/suggest';

export interface VersionDefinition {
  slug: string;
  name: string;
  shortName: string;
  language: string;
  hasOldTestament: boolean;
  hasNewTestament: boolean;
  totalBooks: number;
  totalChapters: number;
  /**
   * Nome de exibição por locale de UI (só as entradas que DIFEREM do `name`
   * nativo — nomes próprios como Almeida/Reina-Valera caem no `name`). Campo
   * opcional e aditivo; ausente até o monorepo republicar o catálogo.
   *
   * MANTENHA EM SINCRONIA com `CatalogVersion` em
   * `scripts/publish-bible-catalog.ts` do monorepo — campo novo aqui só é
   * visível se o publish script também o incluir.
   */
  localizedNames?: Record<string, string>;
  /**
   * Texto de direitos autorais/atribuição da versão (pode ter várias linhas).
   * Opcional e aditivo. Ver nota de sincronia acima.
   */
  copyright?: string;
  /**
   * Só no catálogo de embed: versão com direitos reservados (ou licença não
   * comercial) que a API aberta não serve. Os plugins a mostram como citação.
   */
  restricted?: boolean;
}

export interface VersionCatalog {
  /** Lista completa, na ordem em que o monorepo serializou. */
  versions: readonly VersionDefinition[];
  /**
   * Resolve o slug pedido (case-insensitive) para uma versão do catálogo,
   * seguindo alias de versão que saiu da API (direitos reservados → versão
   * livre do mesmo idioma, `catalog/version-aliases.json`; existe pra cliente
   * antigo — plugin WordPress com NVT salva — não quebrar). Devolve o slug
   * efetivo (o que vai na resposta), a definição e se houve troca (`aliased`,
   * que encurta o cache: ver `contentHeaders`). Único caminho slug → versão:
   * toda rota enxerga os mesmos aliases.
   */
  lookup(slug: string): { slug: string; version: VersionDefinition; aliased: boolean } | null;
  /** Slug do catálogo mais próximo ("did you mean"), ou null. */
  suggest(slug: string): string | null;
}

/** Chave do catálogo serializado no bucket R2 `bible`. */
const R2_CATALOG_KEY = 'catalog/versions.json';
/**
 * Catálogo dos plugins (`/v1/embed`): todas as versões no ar no midvash.com,
 * inclusive as com direitos que a API aberta não serve. Publicado pelo mesmo
 * script do monorepo.
 */
const R2_EMBED_CATALOG_KEY = 'catalog/embed-versions.json';
const R2_ALIASES_KEY = 'catalog/version-aliases.json';

function makeCatalog(
  versions: readonly VersionDefinition[],
  bySlug: ReadonlyMap<string, VersionDefinition>,
  aliases: ReadonlyMap<string, string>,
): VersionCatalog {
  return {
    versions,
    lookup(slug) {
      const requested = slug.toLowerCase().trim();
      const effective = aliases.get(requested) ?? requested;
      const version = bySlug.get(effective);
      return version ? { slug: effective, version, aliased: effective !== requested } : null;
    },
    suggest(slug) {
      return closestString(slug.toLowerCase().trim(), bySlug.keys());
    },
  };
}

const EMPTY_CATALOG: VersionCatalog = makeCatalog([], new Map(), new Map());

/**
 * Memo por isolate. Só é populado em sucesso com dados — ausência ou erro
 * degradam para catálogo vazio (endpoints respondem 404 "version not found" em
 * vez de 500 geral) e permitem retry no próximo request, em vez de prender o
 * isolate num estado ruim.
 */
let cached: VersionCatalog | null = null;
let cachedEmbed: VersionCatalog | null = null;

export async function getVersionCatalog(env: Env): Promise<VersionCatalog> {
  if (cached) return cached;
  const catalog = await loadCatalog(env, R2_CATALOG_KEY);
  if (catalog.versions.length > 0) cached = catalog;
  return catalog;
}

/**
 * Catálogo das rotas `/v1/embed` (plugins). Sem o JSON de embed no R2, cai no
 * catálogo aberto: a rota funciona desde já, só que com as versões livres.
 */
export async function getEmbedCatalog(env: Env): Promise<VersionCatalog> {
  if (cachedEmbed) return cachedEmbed;
  const object = await env.R2_BUCKET.get(R2_EMBED_CATALOG_KEY).catch(() => null);
  const catalog = object ? await loadCatalog(env, R2_EMBED_CATALOG_KEY, object) : null;
  if (catalog && catalog.versions.length > 0) {
    cachedEmbed = catalog;
    return catalog;
  }
  // Memoiza o fallback também: o JSON de embed muda raro e o isolate recicla.
  const open = await getVersionCatalog(env);
  if (open.versions.length > 0) cachedEmbed = open;
  return open;
}

async function loadCatalog(
  env: Env,
  key: string,
  preloaded?: R2ObjectBody,
): Promise<VersionCatalog> {
  let object: R2ObjectBody | null = preloaded ?? null;
  if (!object) {
    try {
      object = await env.R2_BUCKET.get(key);
    } catch (err) {
      console.error(`[catalog] erro ao ler ${key} do R2:`, err);
      return EMPTY_CATALOG;
    }
  }

  if (!object) {
    console.error(`[catalog] ${key} ausente no bucket R2 — degradando para catálogo vazio`);
    return EMPTY_CATALOG;
  }

  let versions: VersionDefinition[];
  try {
    versions = await object.json<VersionDefinition[]>();
  } catch (err) {
    console.error(`[catalog] ${key} é JSON inválido:`, err);
    return EMPTY_CATALOG;
  }

  if (!Array.isArray(versions) || versions.length === 0) {
    console.error(`[catalog] ${key} vazio ou malformado`);
    return EMPTY_CATALOG;
  }

  const bySlug = new Map<string, VersionDefinition>(versions.map((v) => [v.slug, v]));
  return makeCatalog(versions, bySlug, await loadAliases(env, bySlug));
}

/**
 * Aliases são opcionais: ausente ou inválido vira mapa vazio (a versão que
 * saiu responde 404), nunca derruba o catálogo. Alias pra slug fora do
 * catálogo é descartado.
 */
async function loadAliases(
  env: Env,
  bySlug: ReadonlyMap<string, VersionDefinition>,
): Promise<ReadonlyMap<string, string>> {
  try {
    const object = await env.R2_BUCKET.get(R2_ALIASES_KEY);
    if (!object) return new Map();
    const raw = await object.json<Record<string, string>>();
    return new Map(
      Object.entries(raw).filter(([from, to]) => !bySlug.has(from) && bySlug.has(to)),
    );
  } catch (err) {
    console.error(`[catalog] erro ao ler ${R2_ALIASES_KEY}:`, err);
    return new Map();
  }
}
