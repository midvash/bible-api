/**
 * Cache API helpers (Cloudflare edge cache).
 *
 * Padrão usado em todos os handlers:
 *   1. Construir cache key normalizada (lowercase, sem query irrelevante)
 *   2. Tentar match
 *   3. Em miss, processar a request
 *   4. Em sucesso, armazenar via ctx.waitUntil (fire-and-forget)
 */

/**
 * Normaliza a URL da request para servir como cache key estável.
 *
 * - Pathname em lowercase (evita fragmentação `/NVI/John/3` vs `/nvi/john/3`).
 * - Endpoints com `?locale` preservam o locale normalizado, descartam outros.
 * - Demais endpoints removem todos os query params.
 * - Trailing slash removido.
 */
export function normalizeCacheKey(request: Request): Request {
  const url = new URL(request.url);
  url.pathname = url.pathname.toLowerCase();
  if (url.pathname.endsWith('/') && url.pathname.length > 1) {
    url.pathname = url.pathname.slice(0, -1);
  }
  const path = url.pathname;

  // Endpoints com filtro `?locale` (legacy) — preserva o locale normalizado.
  const isLegacyLocaleEndpoint =
    path === '/characters' || path === '/dictionary' || path === '/versions';

  if (isLegacyLocaleEndpoint) {
    const localeParam = url.searchParams.get('locale');
    let normalizedLocale = 'en';
    if (localeParam === 'pt' || localeParam === 'pt-br') {
      normalizedLocale = 'pt-br';
    } else if (localeParam === 'es') {
      normalizedLocale = 'es';
    }
    url.search = `?locale=${normalizedLocale}`;
    return new Request(url.toString(), { method: 'GET' });
  }

  // /v1/versions[?language=xx] — preserva language normalizado em lowercase.
  if (path === '/v1/versions') {
    const lang = (url.searchParams.get('language') ?? '').toLowerCase().trim();
    url.search = lang ? `?language=${lang}` : '';
    return new Request(url.toString(), { method: 'GET' });
  }

  // /v1/books[?testament=old|new] — preserva apenas testament válido.
  if (path === '/v1/books') {
    const testament = url.searchParams.get('testament');
    url.search = testament === 'old' || testament === 'new' ? `?testament=${testament}` : '';
    return new Request(url.toString(), { method: 'GET' });
  }

  url.search = '';
  return new Request(url.toString(), { method: 'GET' });
}

/**
 * Cria cache key sintética para endpoints com query params estruturados.
 */
export function buildCacheKey(parts: Record<string, string | number | undefined>): Request {
  const sorted = Object.entries(parts)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return new Request(`https://api.midvash.com/_cache?${sorted}`, { method: 'GET' });
}

/**
 * Tenta recuperar uma resposta cacheada. Falhas são silenciosas.
 */
export async function cacheGet(cacheKey: Request): Promise<Response | null> {
  try {
    const cached = await caches.default.match(cacheKey);
    return cached ?? null;
  } catch (err) {
    console.warn('[Cache] match error:', err);
    return null;
  }
}

/**
 * Armazena uma resposta no Cache API via waitUntil.
 */
export function cachePut(
  ctx: ExecutionContext,
  cacheKey: Request,
  response: Response,
  label = 'cache',
): void {
  ctx.waitUntil(
    caches.default
      .put(cacheKey, response.clone())
      .catch((err) => console.warn(`[Cache] put error (${label}):`, err)),
  );
}

/**
 * ETag determinístico para conteúdo imutável (chapter / verse / metadata).
 * Mudanças de contrato vivem em /v2 — então o ETag pode ser estável pra sempre.
 */
export function etagFor(parts: (string | number)[]): string {
  return `"${parts.join('-').toLowerCase()}"`;
}

/**
 * Se o cliente mandou `If-None-Match` igual ao etag, retorna 304 sem corpo.
 * Caso contrário, retorna a response original (com header ETag adicionado).
 */
export function withEtag(request: Request, response: Response, etag: string): Response {
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch && ifNoneMatch === etag) {
    const headers = new Headers(response.headers);
    headers.set('ETag', etag);
    headers.delete('Content-Length');
    return new Response(null, { status: 304, headers });
  }
  const headers = new Headers(response.headers);
  headers.set('ETag', etag);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Trata HEAD como GET sem body. Aplicar antes de retornar uma response GET.
 */
export function maybeHead(request: Request, response: Response): Response {
  if (request.method !== 'HEAD') return response;
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/**
 * Serve uma response já cacheada (Cache API hit).
 *
 * A response cacheada já tem o ETag embutido — então em hit sem
 * `If-None-Match` retornamos direto, sem realocar Response/Headers.
 * Em hit com `If-None-Match` válido, devolve 304 reaproveitando os
 * headers cacheados. Em hit com `If-None-Match` divergente, retorna
 * a response original.
 *
 * Hot path: este caminho roda em ~99% das requests, então cada alloc
 * evitada se multiplica por toda a base de tráfego.
 */
export function serveFromCache(request: Request, cached: Response): Response {
  const etag = cached.headers.get('ETag');
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (etag && ifNoneMatch === etag) {
    return new Response(null, { status: 304, headers: cached.headers });
  }
  return maybeHead(request, cached);
}
