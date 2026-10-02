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
 * Base de toda resposta JSON: CORS público + X-Robots-Tag (previne indexação).
 * Sem `Cache-Control` — cada variante abaixo (ou `errorResponse`) define o seu.
 */
export const JSON_BASE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Respostas JSON imutáveis (1 ano, immutable).
 * Conteúdo bíblico publicado nunca muda — versionar via URL pra invalidar.
 */
export const CACHE_HEADERS = {
  ...JSON_BASE_HEADERS,
  'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
} as const;

/**
 * Metadados que evoluem com o catálogo (ex.: doc do root).
 * TTL de 1 dia: mudanças de catálogo aparecem em até 24h em todos os colos,
 * sem depender de purge manual — diferente do conteúdo bíblico (imutável, 1 ano).
 */
export const METADATA_HEADERS = {
  ...JSON_BASE_HEADERS,
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
} as const;

/** Erros 5xx — não cachear, deixar retry funcionar. */
export const ERROR_5XX_HEADERS = {
  ...JSON_BASE_HEADERS,
  'Cache-Control': 'no-store',
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
