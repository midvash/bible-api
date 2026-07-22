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
import { buildCacheKey, etagFor, serveWithCache } from '../lib/cache';
import { legacyErrorResponse } from '../lib/response';
import { BOOKS_BY_ID } from '../lib/book-lookup';
import { extractVerses, fetchChapterFromR2, formatReference } from '../lib/chapter';
import { pickVotdForDate } from '../lib/votd-pool';

// Versão default do VOTD por idioma do catálogo (não só os 9 locales de UI).
// Cada default é uma versão que cobre a Bíblia INTEIRA (o pool do VOTD tem
// referências de AT e NT) — versões parciais fariam o VOTD dar 404 em metade
// dos dias. Preferência por domínio público.
//
// Os 9 locales de UI mantêm exatamente o mapeamento histórico (en=kjv — o
// reader usa NLT, mas a API pública não distribui NLT por copyright; kjv é a
// canônica livre no R2). `pt`/`pt-pt` colapsam via normalizeLocale.
//
// EXCEÇÕES que caem para `kjv` — o VOTD sai em inglês, mas nunca em erro
// (preferível a um 404). Todas verificadas contra os capítulos exatos do pool
// do VOTD (não só flags de AT/NT) em 2026-07:
//   - `gr` (só NT/LXX) e `sw` (só NT): sem Bíblia completa no idioma.
//   - `sr`: a única versão (skd) está no catálogo mas 100% SEM conteúdo no R2.
//   - `ja` (kgy): faltam capítulos do pool (Mateus 27-28, Salmos 139, Romanos 10).
//   - `id` (indonesian): falta TODO o livro de Salmos, muito usado no pool.
// Voltar para a versão nativa quando o conteúdo for publicado e a checagem de
// cobertura passar. Todos os outros idiomas cobrem o pool inteiro no R2.
const DEFAULT_VERSION_BY_LANGUAGE: Record<string, string> = {
  // 9 locales de UI (mapeamento histórico preservado)
  en: 'kjv',
  'pt-br': 'nvt',
  es: 'ntv',
  fr: 'lsg',
  de: 'luth1912',
  it: 'nri',
  zh: 'cuvs',
  ru: 'synodal',
  ko: 'kor',
  // Demais idiomas do catálogo
  ar: 'svd',
  cs: 'bkr',
  da: 'dansk1931',
  eo: 'lsb',
  fi: 'pr1933',
  gr: 'kjv', // só NT/LXX no idioma — fallback en
  he: 'mh', // Modern Hebrew (AT+NT); aleppo/wlc/osmh são só AT
  hu: 'kar',
  id: 'kjv', // indonesian sem Salmos no R2 — fallback en (ver nota acima)
  ja: 'kjv', // kgy com buracos no pool no R2 — fallback en (ver nota acima)
  la: 'vulg',
  nb: 'nb1930',
  nl: 'dutch1917',
  pl: 'bg',
  'pt-pt': 'bpt',
  ro: 'vdc',
  sr: 'kjv', // skd sem conteúdo no R2 — fallback en (ver nota acima)
  sv: 'sv1917',
  sw: 'kjv', // só NT no idioma — fallback en
  tl: 'bnb',
  tr: 'ycv',
  uk: 'kp',
  vi: 'vi1934',
};

// Fallback final quando o idioma pedido não tem default mapeado (idioma novo no
// catálogo antes de ganhar entrada aqui). kjv cobre a Bíblia inteira.
const VOTD_FALLBACK_VERSION = 'kjv';

/**
 * Escolhe a versão default do VOTD para o idioma pedido. Tenta o token cru
 * (`ja`, `he`, `pt-pt`…), depois o locale de UI normalizado (`pt`→`pt-br`),
 * e por fim o fallback global.
 */
export function defaultVotdVersion(rawLanguage: string, locale: ApiLocale): string {
  return (
    DEFAULT_VERSION_BY_LANGUAGE[rawLanguage] ??
    DEFAULT_VERSION_BY_LANGUAGE[locale] ??
    VOTD_FALLBACK_VERSION
  );
}

const VOTD_BASE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
  'Content-Type': 'application/json',
  'X-Robots-Tag': 'noindex, nofollow',
} as const;

/**
 * Segundos até a próxima meia-noite UTC (mínimo 60).
 *
 * O TTL do VOTD precisa expirar na virada do dia, não "24h depois": o
 * Workers Cache (na frente do worker) usa só URL+query como chave — sem a
 * data, um votd cacheado 23h50 UTC seria servido até o dia seguinte.
 */
export function secondsUntilNextUtcDay(now: Date): number {
  const nextMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(60, Math.ceil((nextMidnight - now.getTime()) / 1000));
}

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export function handleVotd(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const rawLanguage = (url.searchParams.get('language') ?? '').toLowerCase().trim();
  const locale = normalizeLocale(rawLanguage);
  const requestedVersion = (url.searchParams.get('version') ?? '').toLowerCase().trim();
  const versionSlug = requestedVersion || defaultVotdVersion(rawLanguage, locale);

  const now = new Date();
  const dateKey = utcDateKey(now);

  const cacheKey = buildCacheKey({
    endpoint: 'votd',
    language: locale,
    version: versionSlug,
    date: dateKey,
  });

  return serveWithCache(request, ctx, cacheKey, 'votd', async () => {
    try {
      const versionData = (await getVersionCatalog(env)).bySlug.get(versionSlug);
      if (!versionData) {
        return legacyErrorResponse('VERSION_NOT_FOUND', `Versão não encontrada: ${versionSlug}`);
      }

      const ref = pickVotdForDate(now);
      const bookData = BOOKS_BY_ID.get(ref.bookId);
      if (!bookData) {
        // pool inválido — não deveria acontecer; 5xx não vai pro cache.
        return new Response(JSON.stringify({ error: 'Pool VOTD inconsistente' }), {
          status: 500,
          headers: ERROR_5XX_HEADERS,
        });
      }

      const verses = await fetchChapterFromR2(env, versionSlug, bookData.id, ref.chapter);
      if (!verses || verses.length === 0) {
        return legacyErrorResponse(
          'CHAPTER_NOT_FOUND',
          `Capítulo não disponível em ${versionSlug}: ${bookData.names.en} ${ref.chapter}`,
        );
      }

      const selected = extractVerses(verses, ref.verseStart, ref.verseEnd);
      if (!selected) {
        // Depende de dado no R2 (capítulo mais curto que o pool espera) — TTL
        // curto de CHAPTER_NOT_FOUND deixa um re-upload de correção aparecer rápido.
        return legacyErrorResponse(
          'CHAPTER_NOT_FOUND',
          `Versículos fora do intervalo: ${bookData.names.en} ${ref.chapter}:${ref.verseStart}-${ref.verseEnd}`,
        );
      }

      const text = selected.join(' ');
      const reference = formatReference(bookData, ref.chapter, ref.verseStart, ref.verseEnd, locale);
      const bookSlug = bookData.slugs[locale] || bookData.slugs.en;

      const versePath =
        ref.verseStart === ref.verseEnd ? `${ref.verseStart}` : `${ref.verseStart}-${ref.verseEnd}`;
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

      const ttl = secondsUntilNextUtcDay(now);
      return {
        response: new Response(body, {
          headers: { ...VOTD_BASE_HEADERS, 'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}` },
        }),
        etag: etagFor([
          'votd',
          dateKey,
          locale,
          versionSlug,
          bookData.id,
          ref.chapter,
          ref.verseStart,
          ref.verseEnd,
        ]),
      };
    } catch (err) {
      console.error('[VOTD] Error:', err);
      return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
        status: 500,
        headers: ERROR_5XX_HEADERS,
      });
    }
  });
}
