import { BOOKS, type BookDefinition } from '../../books';
import { CACHE_HEADERS, type Env } from '../../env';
import {
  cacheGet,
  cachePut,
  etagFor,
  maybeHead,
  normalizeCacheKey,
  serveFromCache,
  withEtag,
} from '../../lib/cache';
import { cachedErrorResponse, okResponse } from '../../lib/response';
import { getBookBySlug } from '../../lib/chapter';

function serializeBook(book: BookDefinition) {
  return {
    id: book.id,
    name: book.names,
    slug: book.slugs,
    abbrev: book.abbrev,
    chapters: book.chapters,
    testament: book.testament,
    category: book.category,
  };
}

// Pre-bake: BOOKS é constante.
const ALL_BOOKS_DATA = BOOKS.map(serializeBook);
const ALL_BOOKS_BODY = JSON.stringify({
  data: ALL_BOOKS_DATA,
  meta: { total: ALL_BOOKS_DATA.length },
});
const OLD_BOOKS_DATA = BOOKS.filter((b) => b.testament === 'old').map(serializeBook);
const OLD_BOOKS_BODY = JSON.stringify({
  data: OLD_BOOKS_DATA,
  meta: { total: OLD_BOOKS_DATA.length, testament: 'old' },
});
const NEW_BOOKS_DATA = BOOKS.filter((b) => b.testament === 'new').map(serializeBook);
const NEW_BOOKS_BODY = JSON.stringify({
  data: NEW_BOOKS_DATA,
  meta: { total: NEW_BOOKS_DATA.length, testament: 'new' },
});
const BOOKS_LIST_ETAG = etagFor(['v1', 'books', 'list', BOOKS.length]);
const OLD_BOOKS_ETAG = etagFor(['v1', 'books', 'old']);
const NEW_BOOKS_ETAG = etagFor(['v1', 'books', 'new']);

/**
 * GET /v1/books[?testament=old|new]
 */
export async function handleV1BooksList(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  const url = new URL(request.url);
  const testamentParam = url.searchParams.get('testament');

  let body = ALL_BOOKS_BODY;
  let etag = BOOKS_LIST_ETAG;
  if (testamentParam === 'old') {
    body = OLD_BOOKS_BODY;
    etag = OLD_BOOKS_ETAG;
  } else if (testamentParam === 'new') {
    body = NEW_BOOKS_BODY;
    etag = NEW_BOOKS_ETAG;
  }

  const response = new Response(body, { headers: CACHE_HEADERS });
  const tagged = withEtag(request, response, etag);
  cachePut(ctx, cacheKey, tagged, 'v1-books-list');
  return maybeHead(request, tagged);
}

/**
 * GET /v1/books/{slug}
 *
 * Aceita slug em qualquer um dos 9 locales suportados.
 */
export async function handleV1BookDetail(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
  slug: string,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  const book = getBookBySlug(slug);
  if (!book) {
    let displaySlug = slug;
    try {
      displaySlug = decodeURIComponent(slug);
    } catch {}
    return cachedErrorResponse(
      request,
      ctx,
      cacheKey,
      'BOOK_NOT_FOUND',
      `Book "${displaySlug}" not found.`,
    );
  }

  const response = okResponse(serializeBook(book));
  const etag = etagFor(['v1', 'book', book.id]);
  const tagged = withEtag(request, response, etag);
  cachePut(ctx, cacheKey, tagged, 'v1-book-detail');
  return maybeHead(request, tagged);
}
