/**
 * GET /votd — Versículo do Dia.
 *
 * Consumido pelo plugin WordPress. Retorna a mesma referência para todos os
 * usuários no mesmo dia UTC (pool curado indexado por dia-do-ano), em
 * qualquer locale + versão suportados.
 *
 * Query params:
 *   - language: locale (pt-br, en, es, fr, de, it, ru, ko, zh). Default: en.
 *   - version : slug da versão bíblica. Default: versão canônica do locale.
 *
 * Resposta:
 *   { reference, text, version, book_slug, chapter, verse_start, verse_end, url }
 *
 * Cache: 24h (max-age=86400). Cache API key embute language+version+date UTC.
 */

import { getVersionCatalog } from '../versions';
import { ERROR_5XX_HEADERS, type Env } from '../env';
import { normalizeLocale, type ApiLocale } from '../lib/locale';
import {
  buildCacheKey,
  cacheGet,
  cachePut,
  etagFor,
  maybeHead,
  serveFromCache,
  withEtag,
} from '../lib/cache';
import {
  BOOKS_BY_ID,
  extractVerses,
  fetchChapterFromR2,
  formatReference,
} from '../lib/chapter';
import { pickVotdForDate } from '../lib/votd-pool';

/**
 * Erro 4xx legado do votd (shape `{ error: string }`) cacheado por 60s.
 */
function votdError(
  request: Request,
  ctx: ExecutionContext,
  cacheKey: Request,
  status: number,
  message: string,
): Response {
  const body = JSON.stringify({ error: message });
  const response = new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
  const etag = etagFor(['votd-error', status, request.url.toLowerCase()]);
  const tagged = withEtag(request, response, etag);
  cachePut(ctx, cacheKey, tagged, `votd-error-${status}`);
  return maybeHead(request, tagged);
}

// Versão default por locale para o VOTD.
// Diverge de packages/i18n/src/config.ts no caso do EN: o reader usa NLT,
// mas a API pública não distribui NLT (copyright restrito). KJV é a versão
// livre canônica em inglês servida no R2.
const DEFAULT_VERSION_BY_LOCALE: Record<ApiLocale, string> = {
  en: 'kjv',
  'pt-br': 'nvt',
  es: 'ntv',
  fr: 'lsg',
  de: 'luth1912',
  it: 'nri',
  zh: 'cuvs',
  ru: 'synodal',
  ko: 'kor',
};

const VOTD_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export async function handleVotd(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get('language'));
  const requestedVersion = (url.searchParams.get('version') ?? '').toLowerCase().trim();
  const versionSlug = requestedVersion || DEFAULT_VERSION_BY_LOCALE[locale];

  const now = new Date();
  const dateKey = utcDateKey(now);

  const cacheKey = buildCacheKey({
    endpoint: 'votd',
    language: locale,
    version: versionSlug,
    date: dateKey,
  });
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  try {
    const versionData = (await getVersionCatalog(env)).bySlug.get(versionSlug);
    if (!versionData) {
      return votdError(request, ctx, cacheKey, 404, `Versão não encontrada: ${versionSlug}`);
    }

    const ref = pickVotdForDate(now);
    const bookData = BOOKS_BY_ID.get(ref.bookId);
    if (!bookData) {
      // pool inválido — não deveria acontecer; 5xx não vai pro cache.
      return maybeHead(
        request,
        new Response(JSON.stringify({ error: 'Pool VOTD inconsistente' }), {
          status: 500,
          headers: ERROR_5XX_HEADERS,
        }),
      );
    }

    const verses = await fetchChapterFromR2(env, versionSlug, bookData.id, ref.chapter);
    if (!verses || verses.length === 0) {
      return votdError(
        request,
        ctx,
        cacheKey,
        404,
        `Capítulo não disponível em ${versionSlug}: ${bookData.names.en} ${ref.chapter}`,
      );
    }

    const selected = extractVerses(verses, ref.verseStart, ref.verseEnd);
    if (!selected) {
      return votdError(
        request,
        ctx,
        cacheKey,
        404,
        `Versículos fora do intervalo: ${bookData.names.en} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`,
      );
    }

    const text = selected.join(' ');
    const reference = formatReference(bookData, ref.chapter, ref.verseStart, ref.verseEnd, locale);
    const bookSlug = bookData.slugs[locale] || bookData.slugs.en;

    const versePath =
      ref.verseStart === ref.verseEnd
        ? `${ref.verseStart}`
        : `${ref.verseStart}-${ref.verseEnd}`;
    const fullUrl = `https://midvash.com/${locale}/${versionSlug}/${bookSlug}/${ref.chapter}/${versePath}`;

    const body = JSON.stringify({
      reference,
      text,
      version: versionSlug,
      book_slug: bookSlug,
      chapter: ref.chapter,
      verse_start: ref.verseStart,
      verse_end: ref.verseEnd,
      url: fullUrl,
    });

    const response = new Response(body, { headers: VOTD_CACHE_HEADERS });
    const etag = etagFor([
      'votd',
      dateKey,
      locale,
      versionSlug,
      bookData.id,
      ref.chapter,
      ref.verseStart,
      ref.verseEnd,
    ]);
    const tagged = withEtag(request, response, etag);
    cachePut(ctx, cacheKey, tagged, 'votd');
    return maybeHead(request, tagged);
  } catch (err) {
    console.error('[VOTD] Error:', err);
    return maybeHead(
      request,
      new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
        status: 500,
        headers: ERROR_5XX_HEADERS,
      }),
    );
  }
}
