/**
 * Formato de resposta padronizado para os endpoints /v1.
 *
 * Sucesso:
 *   { data: T, meta?: { total?, locale?, pagination?, ... } }
 *
 * Erro:
 *   { error: { code, message, details? } }
 *
 * Sucesso = `immutable, max-age=1y`. Erro 4xx = `max-age=60`. Erro 5xx = `no-store`.
 */

import { CACHE_HEADERS, ERROR_4XX_HEADERS, ERROR_5XX_HEADERS } from '../env';
import { cachePut, etagFor, maybeHead, withEtag } from './cache';

export interface ResponseMeta {
  total?: number;
  locale?: string;
  reference?: string;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'INVALID_PARAMS'
  | 'INTERNAL_ERROR'
  | 'VERSION_NOT_FOUND'
  | 'BOOK_NOT_FOUND'
  | 'CHAPTER_NOT_FOUND'
  | 'VERSE_NOT_FOUND';

const HTTP_STATUS_FOR_CODE: Record<ApiErrorCode, number> = {
  NOT_FOUND: 404,
  INVALID_PARAMS: 400,
  INTERNAL_ERROR: 500,
  VERSION_NOT_FOUND: 404,
  BOOK_NOT_FOUND: 404,
  CHAPTER_NOT_FOUND: 404,
  VERSE_NOT_FOUND: 404,
};

/**
 * TTL de cache por código de erro (segundos).
 *
 * Erros determinísticos pela URL (livro inexistente, capítulo fora do
 * range) nunca mudam de resposta — 60s de TTL só servia pra re-executar
 * o worker a cada minuto quando um cliente entrava em loop de 404
 * (issue midvash#1420). Ficam em 1 dia.
 *
 * VERSION_NOT_FOUND fica em 1h: versões novas são adicionadas de tempos
 * em tempos e o TTL limita quanto tempo uma URL já consultada demora a
 * enxergar o lançamento. CHAPTER_NOT_FOUND segue 60s: depende de dado no
 * R2, e um re-upload de correção deve aparecer rápido.
 */
const CACHE_TTL_FOR_CODE: Record<ApiErrorCode, number> = {
  NOT_FOUND: 3600,
  INVALID_PARAMS: 86400,
  INTERNAL_ERROR: 0,
  VERSION_NOT_FOUND: 3600,
  BOOK_NOT_FOUND: 86400,
  CHAPTER_NOT_FOUND: 60,
  VERSE_NOT_FOUND: 86400,
};

/**
 * Constrói uma Response de sucesso com formato { data, meta }.
 */
export function okResponse<T>(data: T, meta?: ResponseMeta): Response {
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };
  return new Response(JSON.stringify(body), { headers: CACHE_HEADERS });
}

/**
 * Constrói uma Response de erro com formato { error: { code, message } }.
 * Status HTTP derivado do código; TTL conforme classe (4xx vs 5xx).
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): Response {
  const body: ApiErrorBody = {
    error: details !== undefined ? { code, message, details } : { code, message },
  };
  const status = HTTP_STATUS_FOR_CODE[code];
  const headers =
    status >= 500
      ? ERROR_5XX_HEADERS
      : { ...ERROR_4XX_HEADERS, 'Cache-Control': `public, max-age=${CACHE_TTL_FOR_CODE[code]}` };
  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * Constrói uma Response de erro 4xx e a registra no Cache API.
 *
 * Erros 4xx têm `max-age=60` — sem cachePut, um scraper batendo numa URL
 * inválida repetidamente re-executa todo o handler. Com cache, o miss
 * inicial absorve o trabalho e os 60s seguintes são servidos do edge.
 *
 * Errors 5xx não são cacheados (Cache-Control: no-store no body).
 */
export function cachedErrorResponse(
  request: Request,
  ctx: ExecutionContext,
  cacheKey: Request,
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): Response {
  const response = errorResponse(code, message, details);
  if (response.status < 500) {
    const etag = etagFor(['error', code, request.url.toLowerCase()]);
    const tagged = withEtag(request, response, etag);
    cachePut(ctx, cacheKey, tagged, `error-${code}`);
    return maybeHead(request, tagged);
  }
  return maybeHead(request, response);
}
