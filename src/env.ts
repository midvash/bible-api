/**
 * Bindings disponíveis para o Worker api-publica.
 * Configurados em wrangler.toml.
 *
 * A API pública é estritamente read-only sobre conteúdo bíblico (versículos,
 * capítulos, versões e livros). Toda fonte é R2 + Cache API no edge.
 *
 * Estratégia de cache: URL é o cache-bust. Mudou contrato? Sobe /v2.
 * /v1 e legacy ficam congelados para sempre com `immutable`.
 */
export interface Env {
  R2_BUCKET: R2Bucket;
}

/**
 * Headers padrão para respostas JSON imutáveis (1 ano, immutable).
 * Conteúdo bíblico publicado nunca muda — versionar via URL pra invalidar.
 * X-Robots-Tag previne indexação pelos buscadores.
 */
export const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Headers para metadados que evoluem com o catálogo (ex.: doc do root).
 * TTL de 1 dia: mudanças de catálogo aparecem em até 24h em todos os colos,
 * sem depender de purge manual — diferente do conteúdo bíblico (imutável, 1 ano).
 */
export const METADATA_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Headers para erros 4xx — TTL curto (60s) pra evitar prender 404 transitório
 * por 1 ano no edge.
 */
export const ERROR_4XX_HEADERS = {
  'Cache-Control': 'public, max-age=60',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Headers para erros 5xx — não cachear, deixar retry funcionar.
 */
export const ERROR_5XX_HEADERS = {
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Headers para respostas HTML (landing page).
 *
 * Landing é regenerada apenas em deploy (HTML pre-bakeado no module scope).
 * TTL de 1 dia no edge é seguro: redeploy invalida via mudança de bundle,
 * e clientes revalidam com ETag determinístico (304 sem corpo).
 */
export const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
} as const;
