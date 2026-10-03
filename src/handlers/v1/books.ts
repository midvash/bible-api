import { BOOKS, serializeBook } from '../../books';
import { CACHE_HEADERS, type Env } from '../../env';
import { etagFor, normalizeCacheKey, serveWithCache } from '../../lib/cache';
import { errorResponse, okResponse } from '../../lib/response';
import { lookupBook } from '../../lib/book-lookup';

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
export function handleV1BooksList(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const testamentParam = new URL(request.url).searchParams.get('testament');
  // Só old/new são variantes; qualquer outro valor serve a lista inteira.
  const testament = testamentParam === 'old' || testamentParam === 'new' ? testamentParam : undefined;

  return serveWithCache(request, ctx, normalizeCacheKey(request, { testament }), 'v1-books-list', () => {
    if (testament === 'old') {
      return { response: new Response(OLD_BOOKS_BODY, { headers: CACHE_HEADERS }), etag: OLD_BOOKS_ETAG };
    }
    if (testament === 'new') {
      return { response: new Response(NEW_BOOKS_BODY, { headers: CACHE_HEADERS }), etag: NEW_BOOKS_ETAG };
    }
    return { response: new Response(ALL_BOOKS_BODY, { headers: CACHE_HEADERS }), etag: BOOKS_LIST_ETAG };
  });
}

/**
 * GET /v1/books/{slug}
 *
 * Aceita slug em qualquer um dos 9 locales suportados (com ou sem hífen).
 */
export function handleV1BookDetail(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
  slug: string,
): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'v1-book-detail', () => {
    const { book, didYouMean, decoded: shown } = lookupBook(slug);
    if (!book) {
      return errorResponse(
        'BOOK_NOT_FOUND',
        didYouMean
          ? `Book "${shown}" not found. Did you mean "${didYouMean}"?`
          : `Book "${shown}" not found.`,
        didYouMean ? { didYouMean } : undefined,
      );
    }

    return {
      response: okResponse(serializeBook(book)),
      etag: etagFor(['v1', 'book', book.id]),
    };
  });
}
