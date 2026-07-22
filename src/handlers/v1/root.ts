import { CACHE_HEADERS, type Env } from '../../env';
import { etagFor, normalizeCacheKey, serveWithCache } from '../../lib/cache';

/**
 * GET /v1
 *
 * Endpoint de descoberta. Body pre-baked (constante).
 */
const ROOT_BODY = JSON.stringify({
  data: {
    name: 'Midvash API',
    version: 'v1',
    documentation: 'https://api.midvash.com/',
    endpoints: [
      { method: 'GET', path: '/v1', description: 'Endpoint discovery (this response)' },
      { method: 'GET', path: '/v1/versions', description: 'List Bible versions' },
      { method: 'GET', path: '/v1/versions/{slug}', description: 'Get a single version by slug' },
      { method: 'GET', path: '/v1/books', description: 'List Bible books' },
      { method: 'GET', path: '/v1/books/{slug}', description: 'Get a single book by slug' },
      {
        method: 'GET',
        path: '/v1/{version}/{book}/{chapter}',
        description: 'Get a full chapter',
      },
      {
        method: 'GET',
        path: '/v1/{version}/{book}/{chapter}/{verse}',
        description: 'Get a single verse or range (e.g. 16 or 16-20)',
      },
      {
        method: 'GET',
        path: '/v1/votd',
        description: 'Verse of the day — same verse for everyone on a given UTC day',
      },
      {
        method: 'GET',
        path: '/v1/passages',
        description:
          'Batch: resolve up to 20 references in one call (?refs=john 3:16,psalms 23&version=kjv)',
      },
      {
        method: 'GET',
        path: '/v1/parse',
        description: 'Parse a free-text reference into its parts (?q=John 3:16-18)',
      },
    ],
    rateLimit: {
      enforced: false,
      description:
        'No rate limit. This is a free, public, edge-cached API — we do not emit 429 or X-RateLimit-* headers. Please honor ETags (304) and batch references via /v1/passages.',
    },
  },
});
// Bump ao mudar o corpo: ETag estável invalida 304s cacheados do discovery antigo.
const ROOT_ETAG = etagFor(['v1', 'root', 'passages', 'parse', 'ratelimit']);

export function handleV1Root(request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'v1-root', () => ({
    response: new Response(ROOT_BODY, { headers: CACHE_HEADERS }),
    etag: ROOT_ETAG,
  }));
}
