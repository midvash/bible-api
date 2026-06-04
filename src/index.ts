/**
 * Midvash API Pública — Cloudflare Worker
 *
 * Servida em api.midvash.com. API REST estritamente focada em conteúdo
 * bíblico: versículos, capítulos, versões e livros. Sem auth, sem chaves,
 * cacheada no edge via Cache API + KV. Toda fonte é R2.
 *
 * ROTAS:
 *   Legado (zero quebra — clientes existentes):
 *     GET /                                  → JSON de documentação
 *     GET /versions                          → lista de versões
 *     GET /books                             → lista de livros
 *     GET /{version}/{book}/{chapter}        → capítulo
 *     GET /{version}/{book}/{chapter}/{v}    → versículo (ou intervalo)
 *
 *   v1 (formato { data, meta }, lookups):
 *     GET /v1                                → descoberta de endpoints
 *     GET /v1/versions[/{slug}]              → versões + lookup
 *     GET /v1/books[/{slug}]                 → livros + lookup
 *     GET /v1/{version}/{book}/{chapter}[/{verses}]
 *
 *   Landing (api.midvash.com/, /es, /pt-br):
 *     GET / com Accept: text/html            → landing HTML
 *     GET /es, /pt-br                        → landing traduzida
 */

import type { Env } from './env';
import { HTML_HEADERS } from './env';
import {
  handleRoot,
  handleVersions,
  handleBooks,
  handleVerse,
} from './handlers/legacy';
import { handleV1 } from './handlers/v1';
import { handleVotd } from './handlers/votd';
import { getLandingHtml } from './landing/page';
import { getVersionCatalog } from './versions';
import { localeFromPath, SUPPORTED_LOCALES, pathForLocale } from './landing/i18n';
import {
  buildCacheKey,
  cacheGet,
  cachePut,
  etagFor,
  maybeHead,
  serveFromCache,
  withEtag,
} from './lib/cache';

const CORS_PREFLIGHT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

const NOT_FOUND_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

const METHOD_NOT_ALLOWED_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Allow': 'GET, HEAD, OPTIONS',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

// ─── Pre-baked bodies (constantes — zero CPU em hot path) ─────────────────
const NOT_FOUND_BODY = JSON.stringify({ error: 'Not Found' });
const NOT_FOUND_ETAG = etagFor(['not-found']);

const ROBOTS_BODY = `User-agent: *\nAllow: /\nDisallow: /v1/\nDisallow: /versions\nDisallow: /books\nDisallow: /votd\nSitemap: https://api.midvash.com/sitemap.xml\n`;
const ROBOTS_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
} as const;
const ROBOTS_ETAG = etagFor(['robots']);

const SITEMAP_BODY = (() => {
  const SITE = 'https://api.midvash.com';
  const alternates = SUPPORTED_LOCALES.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${pathForLocale(l)}"/>`,
  ).join('\n');
  const urls = SUPPORTED_LOCALES.map((l) => pathForLocale(l));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE}${u}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>\n    <changefreq>weekly</changefreq>\n  </url>`,
    )
    .join('\n')}\n</urlset>\n`;
})();
const SITEMAP_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
} as const;
const SITEMAP_ETAG = etagFor(['sitemap']);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_PREFLIGHT_HEADERS });
    }

    // Só GET/HEAD são suportados — qualquer outro verbo retorna 405.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: METHOD_NOT_ALLOWED_HEADERS,
      });
    }

    // ─── SEO: robots.txt + sitemap.xml ───────────────────────────────
    if (path === '/robots.txt') {
      const cacheKey = buildCacheKey({ endpoint: 'robots' });
      const cached = await cacheGet(cacheKey);
      if (cached) return serveFromCache(request, cached);

      const response = new Response(ROBOTS_BODY, { status: 200, headers: ROBOTS_HEADERS });
      const tagged = withEtag(request, response, ROBOTS_ETAG);
      cachePut(ctx, cacheKey, tagged, 'robots');
      return maybeHead(request, tagged);
    }

    if (path === '/sitemap.xml') {
      const cacheKey = buildCacheKey({ endpoint: 'sitemap' });
      const cached = await cacheGet(cacheKey);
      if (cached) return serveFromCache(request, cached);

      const response = new Response(SITEMAP_BODY, { status: 200, headers: SITEMAP_HEADERS });
      const tagged = withEtag(request, response, SITEMAP_ETAG);
      cachePut(ctx, cacheKey, tagged, 'sitemap');
      return maybeHead(request, tagged);
    }

    // ─── /v1/* (formato { data, meta } padronizado) ─────────────────
    if (path === '/v1' || path === '/v1/' || path.startsWith('/v1/')) {
      const pathAfterV1 = path === '/v1' || path === '/v1/' ? '' : path.slice(3);
      return handleV1(request, env, ctx, pathAfterV1);
    }

    // ─── Landing page (browsers) — content negotiation na raiz ──────
    // Rotas /<locale> sempre retornam HTML (nunca foram JSON).
    // / retorna HTML se Accept inclui text/html, senão mantém o JSON
    // legado de documentação para preservar clientes programáticos.
    //
    // Cache key sintética por locale (`landing:<locale>`) ao invés de cache
    // key derivada da URL: as duas variantes de `/` (HTML vs JSON) viram
    // entradas distintas no Cache API sem precisar de `Vary: Accept`, que
    // fragmentava o edge cache por User-Agent.
    const landingLocale = localeFromPath(path);
    if (landingLocale) {
      const accept = request.headers.get('accept') ?? '';
      const wantsHtml = accept.includes('text/html');
      const isLocalizedRoute = landingLocale !== 'en';

      if (wantsHtml || isLocalizedRoute) {
        const cacheKey = buildCacheKey({ endpoint: 'landing', locale: landingLocale });
        const cached = await cacheGet(cacheKey);
        if (cached) return serveFromCache(request, cached);

        const { versions } = await getVersionCatalog(env);
        const response = new Response(getLandingHtml(landingLocale, versions), {
          status: 200,
          headers: { ...HTML_HEADERS, 'Content-Language': landingLocale },
        });
        const etag = etagFor(['landing', landingLocale]);
        const tagged = withEtag(request, response, etag);
        cachePut(ctx, cacheKey, tagged, 'landing');
        return maybeHead(request, tagged);
      }
      // Senão, cai no handler legado de /
    }

    // ─── Rotas legadas ───────────────────────────────────────────────
    if (path === '/' || path === '') {
      return handleRoot(request, env, ctx);
    }

    if (path === '/versions' || path === '/versions/') {
      return handleVersions(request, env, ctx);
    }

    if (path === '/books' || path === '/books/') {
      return handleBooks(request, env, ctx);
    }

    if (path === '/votd' || path === '/votd/') {
      return handleVotd(request, env, ctx);
    }

    // /{version}/{book}/{chapter} ou /{version}/{book}/{chapter}/{verse}
    const verseMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/(\d+)(?:\/(.+))?$/);
    if (verseMatch) {
      return handleVerse(request, env, ctx, verseMatch);
    }

    // 404 catch-all — cacheia por 60s (TTL curto, scrapers param de re-executar).
    const notFoundKey = buildCacheKey({ endpoint: '404', path: path.toLowerCase() });
    const cachedNotFound = await cacheGet(notFoundKey);
    if (cachedNotFound) return serveFromCache(request, cachedNotFound);

    const notFoundResponse = new Response(NOT_FOUND_BODY, {
      status: 404,
      headers: NOT_FOUND_HEADERS,
    });
    const taggedNotFound = withEtag(request, notFoundResponse, NOT_FOUND_ETAG);
    cachePut(ctx, notFoundKey, taggedNotFound, '404');
    return maybeHead(request, taggedNotFound);
  },
};
