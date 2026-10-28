/**
 * Handlers das rotas legadas (pré-/v1), no envelope original de cada uma.
 *
 * São serializadores finos: o ciclo de cache vive em `serveWithCache`
 * (lib/cache), a resolução de conteúdo em `resolveChapter`
 * (lib/resolve-chapter) e a política de erro em `legacyErrorResponse`
 * (lib/response). Melhorias de comportamento (dica "did you mean", TTL de
 * erro por código) valem aqui também — o shape das respostas de sucesso é
 * que permanece o histórico.
 */

import { getVersionCatalog, type VersionCatalog, type VersionDefinition } from '../versions';
import { BOOKS, serializeBook } from '../books';
import { CACHE_HEADERS, METADATA_HEADERS, ERROR_5XX_HEADERS, contentHeaders, type Env } from '../env';
import { contentHash, etagFor, normalizeCacheKey, serveWithCache } from '../lib/cache';
import { legacyErrorResponse } from '../lib/response';
import { resolveChapter } from '../lib/resolve-chapter';
import { parseVerseParam } from '../lib/chapter';

// ─── Pre-baked bodies ──────────────────────────────────────────────────────
/**
 * Root doc derivado lazy do catálogo (contagens reais de versões/idiomas em
 * vez de texto fixo que envelhece). Mesmo shape de resposta de sempre —
 * `endpoints` ganhou o /votd, que existia mas não estava documentado.
 * Memoizado por isolate apenas quando o catálogo veio com dados.
 */
interface PrebakedRoot {
  body: string;
  etag: string;
}
// Memo por catálogo (WeakMap): o aberto e o dos plugins geram corpos diferentes.
const prebakedRoot = new WeakMap<VersionCatalog, PrebakedRoot>();

function getPrebakedRoot(catalog: VersionCatalog): PrebakedRoot {
  const memo = prebakedRoot.get(catalog);
  if (memo) return memo;

  const versionCount = catalog.versions.length;
  const languageCount = new Set(catalog.versions.map((v) => v.language)).size;
  const versionsLabel = versionCount > 0 ? `${versionCount}` : 'Dozens of';
  const languagesLabel = languageCount > 0 ? `${languageCount}` : 'many';
  const base = 'https://api.midvash.com';

  const body = JSON.stringify(
    {
      name: 'Midvash API',
      version: 'v1',
      description: 'Free, no-key public Bible API: verses, chapters, books and versions.',
      documentation: `${base}/docs`,
      openapi: `${base}/openapi.json`,
      endpoints: {
        'GET /v1': { description: 'Endpoint discovery for the v1 API ({ data, meta } envelope)', example: `${base}/v1` },
        'GET /v1/versions': { description: 'List Bible versions', example: `${base}/v1/versions` },
        'GET /v1/versions/{slug}': { description: 'Get a single version by slug', example: `${base}/v1/versions/kjv` },
        'GET /v1/books': { description: 'List Bible books', example: `${base}/v1/books` },
        'GET /v1/books/{slug}': { description: 'Get a single book by slug', example: `${base}/v1/books/john` },
        'GET /v1/{version}/{book}/{chapter}': { description: 'Get a full chapter (?preview=N truncates text)', example: `${base}/v1/kjv/john/3` },
        'GET /v1/{version}/{book}/{chapter}/{verse}': { description: 'Get a verse or a range (16 or 16-20)', example: `${base}/v1/kjv/john/3/16-18` },
        'GET /v1/passages': { description: 'Resolve up to 50 references in one call', example: `${base}/v1/passages?refs=john%203:16,psalms%2023&version=kjv` },
        'GET /v1/parse': { description: 'Parse a free-text reference into its parts', example: `${base}/v1/parse?q=John%203:16-18` },
        'GET /v1/votd': { description: 'Verse of the day (query: language, version)', example: `${base}/v1/votd?language=en` },
        'GET /openapi.json': { description: 'OpenAPI 3.1 spec', example: `${base}/openapi.json` },
        'GET /docs': { description: 'Interactive API reference', example: `${base}/docs` },
        'GET /': { description: 'This document (legacy root)', example: `${base}/` },
        'GET /versions': { description: 'Legacy: list versions', example: `${base}/versions` },
        'GET /books': { description: 'Legacy: list books', example: `${base}/books` },
        'GET /votd': { description: 'Legacy: verse of the day', example: `${base}/votd?language=en` },
        'GET /{version}/{book}/{chapter}': { description: 'Legacy: full chapter', example: `${base}/kjv/john/3` },
        'GET /{version}/{book}/{chapter}/{verse}': { description: 'Legacy: verse or range', example: `${base}/kjv/john/3/16` },
      },
      features: [
        `${versionsLabel} free Bible versions (public domain or open license)`,
        `${languagesLabel} languages`,
        'CORS enabled for public access',
        'Served and cached on the Cloudflare edge',
      ],
      notes: [
        'New integrations should use /v1; the legacy routes stay for existing clients.',
        'Book slugs are accepted in English (john, genesis, psalms) and in other languages.',
        'A version that left the API (reserved rights) is served by the free version of the same language; the response carries the slug that answered.',
        'No rate limit: the API is public and edge-cached. We do not emit 429 or X-RateLimit-* headers. Please honor ETags (304) and batch references with /v1/passages.',
      ],
    },
    null,
    2,
  );

  const result: PrebakedRoot = {
    body,
    // Semente muda junto com o corpo ('en-v1': inglês + rotas /v1), senão
    // cliente com ETag antigo fica preso num 304 do texto anterior.
    etag: etagFor(['legacy', 'root', 'en-v1', versionCount, languageCount]),
  };
  if (versionCount > 0) prebakedRoot.set(catalog, result);
  return result;
}

function serializeVersionLegacy(v: VersionDefinition) {
  return {
    slug: v.slug,
    name: v.name,
    shortName: v.shortName,
    language: v.language,
    hasOldTestament: v.hasOldTestament,
    hasNewTestament: v.hasNewTestament,
    totalBooks: v.totalBooks,
    totalChapters: v.totalChapters,
  };
}

/**
 * Bodies de versões pré-serializados por isolate, derivados lazy do catálogo do
 * R2. Só memoiza quando há dados — catálogo vazio é degradação transitória.
 */
interface PrebakedLegacyVersions {
  allBody: string;
  byLocale: Record<string, string>;
  listEtag: string;
}
const prebakedVersions = new WeakMap<VersionCatalog, PrebakedLegacyVersions>();

/**
 * Idioma de versão para o filtro `?locale` de /versions — mesma regra no
 * catálogo e no param. Só junta as variantes de português (pt, pt-pt → pt-br);
 * o resto fica como está. `normalizeLocale` não serve aqui: ele joga todo
 * idioma fora dos 9 locales de interface em `en`, e `?locale=en` devolvia
 * grego, hebraico etc. junto com as versões em inglês.
 */
function versionLanguageKey(language: string): string {
  const v = language.toLowerCase().trim();
  return v === 'pt' || v === 'pt-pt' ? 'pt-br' : v;
}

function getPrebakedVersions(catalog: VersionCatalog): PrebakedLegacyVersions {
  const memo = prebakedVersions.get(catalog);
  if (memo) return memo;

  const allBody = JSON.stringify({ versions: catalog.versions.map(serializeVersionLegacy) });

  const byLocale: Record<string, string> = {};
  const langs = new Set(catalog.versions.map((v) => versionLanguageKey(v.language)));
  for (const lang of langs) {
    const filtered = catalog.versions
      .filter((v) => versionLanguageKey(v.language) === lang)
      .map(serializeVersionLegacy);
    byLocale[lang] = JSON.stringify({ versions: filtered });
  }

  const result: PrebakedLegacyVersions = {
    allBody,
    byLocale,
    listEtag: etagFor(['legacy', 'versions', contentHash(allBody)]),
  };
  if (catalog.versions.length > 0) prebakedVersions.set(catalog, result);
  return result;
}

const BOOKS_BODY = JSON.stringify({ books: BOOKS.map(serializeBook) });
const BOOKS_ETAG = etagFor(['legacy', 'books', BOOKS.length]);

// ─── GET / ────────────────────────────────────────────────────────────────
export function handleRoot(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'root', async () => {
    const root = getPrebakedRoot(await getVersionCatalog(env));
    // Vary: Accept — `/` também serve a landing HTML; ver comentário no index.
    return {
      response: new Response(root.body, { headers: { ...METADATA_HEADERS, Vary: 'Accept' } }),
      etag: root.etag,
    };
  });
}

// Lista de versões = METADATA (1 dia), não imutável: o catálogo muda no R2 sem
// deploy. `gen` na chave pula as entradas antigas gravadas com 1 ano no Cache
// API (ver CACHE_GEN em v1/versions.ts).
const VERSIONS_CACHE_GEN = 2;

// ─── GET /versions ────────────────────────────────────────────────────────
export function handleVersions(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const localeParam = new URL(request.url).searchParams.get('locale');
  // Sem `?locale` = lista inteira; com = filtrada pelo locale canônico (pt-pt →
  // pt-br). A chave usa o mesmo valor: antes `/versions` e `/versions?locale=en`
  // caíam na mesma entrada do edge com corpos diferentes.
  const locale = localeParam?.trim() ? versionLanguageKey(localeParam) : undefined;

  return serveWithCache(request, ctx, normalizeCacheKey(request, { locale, gen: VERSIONS_CACHE_GEN }), 'versions', async () => {
    const { allBody, byLocale, listEtag } = getPrebakedVersions(await getVersionCatalog(env));

    if (!locale) {
      return { response: new Response(allBody, { headers: METADATA_HEADERS }), etag: listEtag };
    }

    const body = byLocale[locale] ?? JSON.stringify({ versions: [] });
    return {
      response: new Response(body, { headers: METADATA_HEADERS }),
      etag: etagFor(['legacy', 'versions', locale, contentHash(body)]),
    };
  });
}

// ─── GET /books ───────────────────────────────────────────────────────────
export function handleBooks(request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'books', () => ({
    response: new Response(BOOKS_BODY, { headers: CACHE_HEADERS }),
    etag: BOOKS_ETAG,
  }));
}

// ─── GET /{version}/{book}/{chapter}[/{verse}] ────────────────────────────
export function handleVerse(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  match: RegExpMatchArray,
): Promise<Response> {
  const [, version, book, chapter, verseParam] = match;

  return serveWithCache(request, ctx, normalizeCacheKey(request), 'verse', async () => {
    try {
      // Segmento de versículo inválido ("abc") serve o capítulo inteiro.
      const r = await resolveChapter(env, version, book, parseInt(chapter, 10), parseVerseParam(verseParam));

      switch (r.kind) {
        case 'version_not_found':
          return legacyErrorResponse(
            'VERSION_NOT_FOUND',
            r.didYouMean
              ? `Versão não encontrada: ${version}. Você quis dizer "${r.didYouMean}"?`
              : `Versão não encontrada: ${version}`,
            r.didYouMean ? { didYouMean: r.didYouMean } : undefined,
          );
        case 'book_not_found':
          return legacyErrorResponse(
            'BOOK_NOT_FOUND',
            r.didYouMean
              ? `Livro não encontrado: ${r.bookDecoded}. Você quis dizer "${r.didYouMean}"?`
              : `Livro não encontrado: ${r.bookDecoded}`,
            r.didYouMean ? { didYouMean: r.didYouMean } : undefined,
          );
        case 'invalid_chapter':
          return legacyErrorResponse(
            'INVALID_PARAMS',
            `Capítulo inválido: ${chapter}. O livro ${r.book.names['en']} tem ${r.book.chapters} capítulos.`,
          );
        case 'chapter_not_found':
          return legacyErrorResponse(
            'CHAPTER_NOT_FOUND',
            `Capítulo não encontrado: ${r.book.names['en']} ${r.chapterNum}`,
          );
        case 'verse_out_of_range': {
          const requested =
            r.range.start === r.range.end
              ? `versículo ${r.range.start}`
              : `versículos ${r.range.start}-${r.range.end}`;
          return legacyErrorResponse(
            'VERSE_NOT_FOUND',
            `Versículo(s) não encontrado(s). O capítulo ${r.chapterNum} tem ${r.maxVerses} versículos.`,
            { chapter: r.chapterNum, maxVerses: r.maxVerses, requested },
          );
        }
      }

      // Sucesso — envelope legado (campos planos).
      const bookName = r.book.names['en'];
      if (!r.selection) {
        return {
          response: new Response(
            JSON.stringify({
              version: r.versionSlug,
              book,
              bookName,
              chapter: r.chapterNum,
              verses: r.verses,
              copyright: r.version.copyright,
            }),
            { headers: contentHeaders(r.aliased) },
          ),
          etag: etagFor(['legacy', r.versionSlug, r.book.id, r.chapterNum, 'cr']),
        };
      }

      return {
        response: new Response(
          JSON.stringify({
            version: r.versionSlug,
            book,
            bookName,
            chapter: r.chapterNum,
            verse: r.selection.range.start,
            verseEnd: r.selection.range.end,
            text: r.selection.text,
            reference: r.selection.reference,
            copyright: r.version.copyright,
          }),
          { headers: contentHeaders(r.aliased) },
        ),
        etag: etagFor([
          'legacy',
          r.versionSlug,
          r.book.id,
          r.chapterNum,
          r.selection.range.start,
          r.selection.range.end,
          'cr',
        ]),
      };
    } catch (error) {
      console.error('[API] Error:', error);
      return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
        status: 500,
        headers: ERROR_5XX_HEADERS,
      });
    }
  });
}
