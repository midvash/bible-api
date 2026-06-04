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
    ],
  },
});
const ROOT_ETAG = etagFor(['v1', 'root']);

export async function handleV1Root(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  const response = new Response(ROOT_BODY, { headers: CACHE_HEADERS });
  const tagged = withEtag(request, response, ROOT_ETAG);
  cachePut(ctx, cacheKey, tagged, 'v1-root');
  return maybeHead(request, tagged);
}
