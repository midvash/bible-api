/**
 * GET /v1/passages?refs=<lista>&version=<slug>
 *
 * Resolve VÁRIAS referências numa resposta só. Motivação: o plugin WordPress
 * hoje faz 1 request por referência por hover; com o batch ele pré-busca todas
 * as referências de um post numa chamada.
 *
 *   /v1/passages?refs=john 3:16,genesis 1:1-3,psalms 23&version=kjv
 *
 * - Até 50 refs por request (400 acima disso) — dimensionado pro middleware
 *   SSR do plugin EmDash, que pré-aquece 10–30 referências por página.
 * - `version` é comum ao batch: versão inválida → 404 no batch inteiro.
 * - Cada ref é resolvida independente: uma ref ruim vira `{ ref, error }` no
 *   seu lugar do array, sem derrubar o batch. A ordem do array espelha o input.
 *
 * Cada item OK espelha o shape do endpoint /v1 de versículo/capítulo.
 * Envelope: `{ data: Item[], meta: { total, version, resolved, failed } }`.
 */

import type { Env } from '../../env';
import { CACHE_HEADERS, contentHeaders } from '../../env';
import { buildCacheKey, etagFor, serveWithCache } from '../../lib/cache';
import { errorResponse } from '../../lib/response';
import { getVersionCatalog, type VersionCatalog } from '../../versions';
import { resolveChapter } from '../../lib/resolve-chapter';
import { parseReference } from '../../lib/reference';

const MAX_REFS = 50;

/**
 * TTL para batches que contêm ao menos um erro. Erros de livro/capítulo/range
 * são determinísticos, mas `chapter_not_found` depende de dado no R2 — um
 * re-upload de correção deve aparecer rápido (mesma lógica do CHAPTER_NOT_FOUND
 * em response.ts). Batches 100% OK são imutáveis (CACHE_HEADERS, 1 ano).
 */
const PARTIAL_HEADERS = {
  ...CACHE_HEADERS,
  'Cache-Control': 'public, max-age=300, s-maxage=300',
} as const;

interface PassageOk {
  ref: string;
  version: string;
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseEnd: number;
  text: string;
  verses: string[];
  reference: string;
}

interface PassageError {
  ref: string;
  error: string;
}

type PassageItem = PassageOk | PassageError;

/** Variação das rotas `/v1/embed`: outro catálogo, menos refs, cache de 1 dia. */
export interface PassagesVariant {
  endpoint: string;
  maxRefs: number;
  catalog: (env: Env) => Promise<VersionCatalog>;
  /** Sucesso imutável (1 ano)? false = 1 dia. */
  immutable: boolean;
}

const OPEN_VARIANT: PassagesVariant = {
  endpoint: 'v1-passages',
  maxRefs: MAX_REFS,
  catalog: getVersionCatalog,
  immutable: true,
};

export function handleV1Passages(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  variant: PassagesVariant = OPEN_VARIANT,
): Promise<Response> {
  const url = new URL(request.url);
  const refsParam = (url.searchParams.get('refs') ?? '').trim();
  const versionParam = (url.searchParams.get('version') ?? '').toLowerCase().trim();

  if (!versionParam) {
    return Promise.resolve(
      errorResponse('INVALID_PARAMS', 'Missing required query param: version.'),
    );
  }
  if (!refsParam) {
    return Promise.resolve(
      errorResponse('INVALID_PARAMS', 'Missing required query param: refs (comma-separated).'),
    );
  }

  const rawRefs = refsParam
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (rawRefs.length === 0) {
    return Promise.resolve(errorResponse('INVALID_PARAMS', 'No valid references in refs.'));
  }
  if (rawRefs.length > variant.maxRefs) {
    return Promise.resolve(
      errorResponse('INVALID_PARAMS', `Too many references: ${rawRefs.length}. Max is ${variant.maxRefs}.`, {
        max: variant.maxRefs,
        received: rawRefs.length,
      }),
    );
  }

  // Chave de cache preserva a ORDEM do input (o array de resposta a espelha) e
  // só normaliza cada ref (lowercase + whitespace colapsado) para maximizar hits.
  const normalizedRefs = rawRefs.map((r) => r.toLowerCase().replace(/\s+/g, ' '));
  const cacheKey = buildCacheKey({
    endpoint: variant.endpoint,
    version: versionParam,
    refs: normalizedRefs.join('|'),
  });

  return serveWithCache(request, ctx, cacheKey, variant.endpoint, async () => {
    try {
      const catalog = await variant.catalog(env);
      // Versão que saiu da API (sem licença) vira a livre do mesmo idioma.
      const found = catalog.lookup(versionParam);
      if (!found) {
        return errorResponse('VERSION_NOT_FOUND', `Version "${versionParam}" not found.`, {
          availableVersions: catalog.versions.length,
        });
      }

      const items: PassageItem[] = [];
      for (const ref of rawRefs) {
        items.push(await resolveOne(env, catalog, found.slug, ref));
      }

      const failed = items.filter((it): it is PassageError => 'error' in it).length;
      const resolved = items.length - failed;

      const body = JSON.stringify({
        data: items,
        meta: {
          total: items.length,
          version: found.slug,
          resolved,
          failed,
          copyright: found.version.copyright,
        },
      });

      // Batch imutável só quando tudo resolveu; senão TTL curto (ver PARTIAL_HEADERS).
      // Versão trocada por alias: 1 dia (ver contentHeaders).
      const headers = failed > 0 ? PARTIAL_HEADERS : contentHeaders(found.aliased || !variant.immutable);
      return {
        response: new Response(body, { headers }),
        // 'p2': itens de capítulo ganharam text/verse/verseEnd — bump pro
        // ETag antigo não servir 304 do shape anterior.
        // A aberta mantém a semente de sempre ('v1', 'passages'): ETag igual, sem 304 perdido.
        etag: etagFor([...variant.endpoint.split('-'), 'p2', 'cr', versionParam, failed, normalizedRefs.join('|')]),
      };
    } catch (error) {
      console.error('[v1/passages] Error:', error);
      return errorResponse('INTERNAL_ERROR', 'Internal server error.');
    }
  });
}

/** Resolve uma referência isolada para um item do batch (nunca lança). */
async function resolveOne(
  env: Env,
  catalog: VersionCatalog,
  version: string,
  ref: string,
): Promise<PassageItem> {
  const parsed = parseReference(ref);
  if (!parsed) {
    return { ref, error: `Could not parse reference: "${ref}".` };
  }

  const range =
    parsed.verseStart === null
      ? null
      : { start: parsed.verseStart, end: parsed.verseEnd ?? parsed.verseStart };
  const r = await resolveChapter(env, version, parsed.bookQuery, parsed.chapter, range, catalog);

  switch (r.kind) {
    case 'version_not_found':
      // Versão já validada no batch; defensivo.
      return { ref, error: `Version "${version}" not found.` };
    case 'book_not_found':
      return {
        ref,
        error: r.didYouMean
          ? `Book "${parsed.bookRaw}" not found. Did you mean "${r.didYouMean}"?`
          : `Book "${parsed.bookRaw}" not found.`,
      };
    case 'invalid_chapter':
      return {
        ref,
        error: `Invalid chapter ${parsed.chapter}. ${r.book.names.en} has ${r.book.chapters} chapters.`,
      };
    case 'chapter_not_found':
      return {
        ref,
        error: `Chapter not found: ${r.book.names.en} ${r.chapterNum} (${r.version.shortName}).`,
      };
    case 'verse_out_of_range':
      return {
        ref,
        error: `Verse(s) out of range. ${r.book.names.en} ${r.chapterNum} has ${r.maxVerses} verses.`,
      };
  }

  // kind === 'ok' — capítulo inteiro espelha o shape de versículo (text/
  // verse/verseEnd sempre presentes), igual ao endpoint /v1 de capítulo.
  if (!r.selection) {
    return {
      ref,
      version: r.versionSlug,
      book: r.book.slugs.en,
      bookName: r.book.names.en,
      chapter: r.chapterNum,
      verse: 1,
      verseEnd: r.verses.length,
      text: r.verses.join(' '),
      verses: r.verses,
      reference: `${r.book.names.en} ${r.chapterNum}`,
    };
  }

  return {
    ref,
    version: r.versionSlug,
    book: r.book.slugs.en,
    bookName: r.book.names.en,
    chapter: r.chapterNum,
    verse: r.selection.range.start,
    verseEnd: r.selection.range.end,
    text: r.selection.text,
    verses: r.selection.verses,
    reference: r.selection.reference,
  };
}
