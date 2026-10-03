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
}

export interface VersionCatalog {
  /** Lista completa, na ordem em que o monorepo serializou. */
  versions: readonly VersionDefinition[];
  /**
   * Resolve o slug pedido (case-insensitive) para uma versão do catálogo,
   * seguindo alias de versão que saiu da API (direitos reservados → versão
   * livre do mesmo idioma, `catalog/version-aliases.json`; existe pra cliente
   * antigo — plugin WordPress com NVT salva — não quebrar). Devolve o slug
   * efetivo (o que vai na resposta) e a definição. Único caminho slug → versão:
   * toda rota enxerga os mesmos aliases.
   */
  lookup(slug: string): { slug: string; version: VersionDefinition } | null;
  /** Slug do catálogo mais próximo ("did you mean"), ou null. */
  suggest(slug: string): string | null;
}

/** Chave do catálogo serializado no bucket R2 `bible`. */
const R2_CATALOG_KEY = 'catalog/versions.json';
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
      return version ? { slug: effective, version } : null;
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

export async function getVersionCatalog(env: Env): Promise<VersionCatalog> {
  if (cached) return cached;

  let object: R2ObjectBody | null = null;
  try {
    object = await env.R2_BUCKET.get(R2_CATALOG_KEY);
  } catch (err) {
    console.error(`[catalog] erro ao ler ${R2_CATALOG_KEY} do R2:`, err);
    return EMPTY_CATALOG;
  }

  if (!object) {
    console.error(
      `[catalog] ${R2_CATALOG_KEY} ausente no bucket R2 — degradando para catálogo vazio`,
    );
    return EMPTY_CATALOG;
  }

  let versions: VersionDefinition[];
  try {
    versions = await object.json<VersionDefinition[]>();
  } catch (err) {
    console.error(`[catalog] ${R2_CATALOG_KEY} é JSON inválido:`, err);
    return EMPTY_CATALOG;
  }

  if (!Array.isArray(versions) || versions.length === 0) {
    console.error(`[catalog] ${R2_CATALOG_KEY} vazio ou malformado`);
    return EMPTY_CATALOG;
  }

  const bySlug = new Map<string, VersionDefinition>(versions.map((v) => [v.slug, v]));
  cached = makeCatalog(versions, bySlug, await loadAliases(env, bySlug));
  return cached;
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
