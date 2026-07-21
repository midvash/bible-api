/**
 * Handlers das rotas legadas da api-publica.
 *
 * Estas rotas existem desde a v1.0 e são consumidas por integrações
 * externas (plugin WordPress, scrapers, web app). NENHUMA mudança de
 * comportamento é permitida aqui — qualquer melhoria vai para /v1.
 *
 * Conteúdo continua imutável (max-age=1y); erros 4xx ganharam TTL curto
 * pra evitar prender 404 transitório no edge por 1 ano.
 */

import { getVersionCatalog, type VersionCatalog, type VersionDefinition } from '../versions';
import { BOOKS } from '../books';
import { CACHE_HEADERS, ERROR_5XX_HEADERS, type Env } from '../env';
import { normalizeLocale } from '../lib/locale';
import {
  cacheGet,
  cachePut,
  etagFor,
  maybeHead,
  normalizeCacheKey,
  serveFromCache,
  withEtag,
} from '../lib/cache';
import {
  fetchChapterFromR2,
  getBookBySlug,
  parseVerseParam,
  extractVerses,
  formatReference,
} from '../lib/chapter';

/**
 * Constrói erro 4xx cacheado no padrão legado (corpo `{ error: string }`).
 * Diferente do `errorResponse` v1, este preserva o shape histórico.
 */
function legacyError(
  request: Request,
  ctx: ExecutionContext,
  cacheKey: Request,
  status: number,
  message: string,
  // Erros determinísticos pela URL (livro inexistente) podem cachear mais —
  // 60s só re-executa o worker quando um cliente entra em loop de 404.
  ttlSeconds = 60,
): Response {
  const body = JSON.stringify({ error: message });
  const response = new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttlSeconds}`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
  const etag = etagFor(['legacy-error', status, request.url.toLowerCase()]);
  const tagged = withEtag(request, response, etag);
  cachePut(ctx, cacheKey, tagged, `legacy-error-${status}`);
  return maybeHead(request, tagged);
}

// ─── Pre-baked bodies (input é constante) ──────────────────────────────────
const ROOT_BODY = JSON.stringify(
  {
    name: 'Midvash API Pública',
    version: '1.0.0',
    description: 'API pública para acesso a versículos e versões da Bíblia',
    endpoints: {
      'GET /': { description: 'Documentação da API (este endpoint)', example: 'https://api.midvash.com/' },
      'GET /versions': { description: 'Lista todas as versões bíblicas disponíveis', example: 'https://api.midvash.com/versions' },
      'GET /books': { description: 'Lista todos os livros da Bíblia', example: 'https://api.midvash.com/books' },
      'GET /{version}/{book}/{chapter}': { description: 'Retorna um capítulo completo', example: 'https://api.midvash.com/nvi/john/3' },
      'GET /{version}/{book}/{chapter}/{verse}': { description: 'Retorna um versículo específico', example: 'https://api.midvash.com/nvi/john/3/16' },
      'GET /{version}/{book}/{chapter}/{verse-start}-{verse-end}': { description: 'Retorna um intervalo de versículos', example: 'https://api.midvash.com/nvi/john/3/16-20' },
    },
    features: [
      'Cache máximo para dados imutáveis (TTL: 1 ano)',
      'CORS habilitado para acesso público',
      'Suporte a múltiplos idiomas (pt-br, en, es)',
      '70+ versões bíblicas disponíveis',
      'Acesso rápido via Cloudflare Edge Network',
    ],
    notes: [
      'Todos os dados são imutáveis e estão em cache por 1 ano',
      'Use slugs em inglês para os livros (ex: john, genesis, psalms)',
      'A API aceita slugs de livros em diferentes idiomas',
      'Para listar versões disponíveis, acesse /versions',
    ],
  },
  null,
  2,
);
const ROOT_ETAG = etagFor(['legacy', 'root']);

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
 * R2 (antes eram constantes de module scope, com catálogo de import build-time).
 * Só memoiza quando há dados — catálogo vazio é degradação transitória do R2.
 */
interface PrebakedLegacyVersions {
  allBody: string;
  byLocale: Record<string, string>;
  listEtag: string;
}
let prebakedVersions: PrebakedLegacyVersions | null = null;

function getPrebakedVersions(catalog: VersionCatalog): PrebakedLegacyVersions {
  if (prebakedVersions) return prebakedVersions;

  const allBody = JSON.stringify({ versions: catalog.versions.map(serializeVersionLegacy) });

  const byLocale: Record<string, string> = {};
  // pt-pt agrupa com pt-br para compatibilidade legada
  const localeKey = (lang: string) => (lang === 'pt-pt' ? 'pt-br' : lang);
  const langs = new Set(catalog.versions.map((v) => localeKey(v.language)));
  for (const lang of langs) {
    const filtered = catalog.versions
      .filter((v) => localeKey(v.language) === lang)
      .map(serializeVersionLegacy);
    byLocale[lang] = JSON.stringify({ versions: filtered });
  }

  const result: PrebakedLegacyVersions = {
    allBody,
    byLocale,
    listEtag: etagFor(['legacy', 'versions', catalog.versions.length]),
  };
  if (catalog.versions.length > 0) prebakedVersions = result;
  return result;
}

const BOOKS_BODY = JSON.stringify({
  books: BOOKS.map((book) => ({
    id: book.id,
    name: book.names,
    slug: book.slugs,
    abbrev: book.abbrev,
    chapters: book.chapters,
    testament: book.testament,
    category: book.category,
  })),
});
const BOOKS_ETAG = etagFor(['legacy', 'books', BOOKS.length]);

// ─── GET / ────────────────────────────────────────────────────────────────
export async function handleRoot(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  const response = new Response(ROOT_BODY, { headers: CACHE_HEADERS });
  const tagged = withEtag(request, response, ROOT_ETAG);
  cachePut(ctx, cacheKey, tagged, 'root');
  return maybeHead(request, tagged);
}

// ─── GET /versions ────────────────────────────────────────────────────────
export async function handleVersions(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  const { allBody, byLocale, listEtag } = getPrebakedVersions(await getVersionCatalog(env));

  const url = new URL(request.url);
  const localeParam = url.searchParams.get('locale');

  let body = allBody;
  let etag = listEtag;
  if (localeParam) {
    const normalizedLocale = normalizeLocale(localeParam);
    body = byLocale[normalizedLocale] ?? JSON.stringify({ versions: [] });
    etag = etagFor(['legacy', 'versions', normalizedLocale]);
  }

  const response = new Response(body, { headers: CACHE_HEADERS });
  const tagged = withEtag(request, response, etag);
  cachePut(ctx, cacheKey, tagged, 'versions');
  return maybeHead(request, tagged);
}

// ─── GET /books ───────────────────────────────────────────────────────────
export async function handleBooks(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  const response = new Response(BOOKS_BODY, { headers: CACHE_HEADERS });
  const tagged = withEtag(request, response, BOOKS_ETAG);
  cachePut(ctx, cacheKey, tagged, 'books');
  return maybeHead(request, tagged);
}

// ─── GET /{version}/{book}/{chapter}[/{verse}] ────────────────────────────
export async function handleVerse(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  match: RegExpMatchArray,
): Promise<Response> {
  const [, version, book, chapter, verseParam] = match;

  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  try {
    const versionSlug = version.toLowerCase();
    const catalog = await getVersionCatalog(env);
    const versionData = catalog.bySlug.get(versionSlug);
    if (!versionData) {
      return legacyError(request, ctx, cacheKey, 404, `Versão não encontrada: ${version}`);
    }

    const bookData = getBookBySlug(book);
    if (!bookData) {
      return legacyError(request, ctx, cacheKey, 404, `Livro não encontrado: ${book}`, 86400);
    }

    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookData.chapters) {
      return legacyError(
        request,
        ctx,
        cacheKey,
        400,
        `Capítulo inválido: ${chapter}. O livro ${bookData.names['en']} tem ${bookData.chapters} capítulos.`,
      );
    }

    const verses = await fetchChapterFromR2(env, versionSlug, bookData.id, chapterNum);
    if (!verses || verses.length === 0) {
      return legacyError(
        request,
        ctx,
        cacheKey,
        404,
        `Capítulo não encontrado: ${bookData.names['en']} ${chapterNum}`,
      );
    }

    const verseRange = parseVerseParam(verseParam);

    if (!verseRange) {
      const bookName = bookData.names['en'];
      const response = new Response(
        JSON.stringify({
          version: versionSlug,
          book,
          bookName,
          chapter: chapterNum,
          verses,
        }),
        { headers: CACHE_HEADERS },
      );
      const etag = etagFor(['legacy', versionSlug, bookData.id, chapterNum]);
      const tagged = withEtag(request, response, etag);
      cachePut(ctx, cacheKey, tagged, 'chapter');
      return maybeHead(request, tagged);
    }

    const selectedVerses = extractVerses(verses, verseRange.start, verseRange.end);
    if (!selectedVerses) {
      // Shape histórico do erro preservado (clientes externos podem depender):
      // mantém os campos chapter/maxVerses/requested além de error.
      const requested =
        verseRange.start === verseRange.end
          ? `versículo ${verseRange.start}`
          : `versículos ${verseRange.start}-${verseRange.end}`;
      const body = JSON.stringify({
        error: `Versículo(s) não encontrado(s). O capítulo ${chapterNum} tem ${verses.length} versículos.`,
        chapter: chapterNum,
        maxVerses: verses.length,
        requested,
      });
      const errResponse = new Response(body, {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
      const etag = etagFor([
        'legacy-error',
        404,
        versionSlug,
        bookData.id,
        chapterNum,
        verseRange.start,
        verseRange.end,
      ]);
      const tagged = withEtag(request, errResponse, etag);
      cachePut(ctx, cacheKey, tagged, 'legacy-error-verse-range');
      return maybeHead(request, tagged);
    }

    const text = selectedVerses.join(' ');
    const bookName = bookData.names['en'];
    const reference = formatReference(
      bookData,
      chapterNum,
      verseRange.start,
      verseRange.end,
      'en',
    );

    const response = new Response(
      JSON.stringify({
        version: versionSlug,
        book,
        bookName,
        chapter: chapterNum,
        verse: verseRange.start,
        verseEnd: verseRange.end,
        text,
        reference,
      }),
      { headers: CACHE_HEADERS },
    );
    const etag = etagFor([
      'legacy',
      versionSlug,
      bookData.id,
      chapterNum,
      verseRange.start,
      verseRange.end,
    ]);
    const tagged = withEtag(request, response, etag);
    cachePut(ctx, cacheKey, tagged, 'verse');
    return maybeHead(request, tagged);
  } catch (error) {
    console.error('[API] Error:', error);
    return maybeHead(
      request,
      new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
        status: 500,
        headers: ERROR_5XX_HEADERS,
      }),
    );
  }
}
