/**
 * Montagem de respostas JSON — o único lugar que conhece envelopes e
 * política de status/TTL de erro.
 *
 * Dois envelopes convivem:
 *   - v1:      sucesso `{ data, meta? }`, erro `{ error: { code, message, details? } }`
 *   - legado:  erro `{ error: string, ...extras }` (rotas raiz e /votd)
 *
 * Ambos usam as MESMAS tabelas de status e TTL por código — a política é
 * uma só, o shape é escolha do endpoint. Sucesso = `immutable, max-age=1y`.
 * Erro 4xx = TTL por código. Erro 5xx = `no-store` (nunca cacheia).
 *
 * Funções aqui são puras (Request → nada, retornam Response); o ciclo de
 * cache é responsabilidade de `serveWithCache` (lib/cache).
 */

import { CACHE_HEADERS, ERROR_4XX_HEADERS, ERROR_5XX_HEADERS } from '../env';

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
  return new Response(JSON.stringify(body), {
    status: HTTP_STATUS_FOR_CODE[code],
    headers: errorHeaders(code),
  });
}

function errorHeaders(code: ApiErrorCode): HeadersInit {
  return HTTP_STATUS_FOR_CODE[code] >= 500
    ? ERROR_5XX_HEADERS
    : { ...ERROR_4XX_HEADERS, 'Cache-Control': `public, max-age=${CACHE_TTL_FOR_CODE[code]}` };
}

/**
 * Erro no envelope legado (`{ error: string, ...extras }`), com a mesma
 * política de status/TTL por código do envelope v1. Usado pelas rotas
 * raiz e /votd, que nasceram com esse shape.
 */
export function legacyErrorResponse(
  code: ApiErrorCode,
  message: string,
  extras?: Record<string, unknown>,
): Response {
  const body = JSON.stringify({ error: message, ...extras });
  return new Response(body, { status: HTTP_STATUS_FOR_CODE[code], headers: errorHeaders(code) });
}
