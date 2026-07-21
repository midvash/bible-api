import { getVersionCatalog } from '../../versions';
import type { Env } from '../../env';
import {
  cacheGet,
  cachePut,
  etagFor,
  maybeHead,
  normalizeCacheKey,
  serveFromCache,
  withEtag,
} from '../../lib/cache';
import { cachedErrorResponse, errorResponse, okResponse } from '../../lib/response';
import {
  fetchChapterFromR2,
  getBookBySlug,
  parseVerseParam,
  extractVerses,
  formatReference,
} from '../../lib/chapter';
import { closestString, suggestBookSlug } from '../../lib/suggest';

/**
 * GET /v1/{version}/{book}/{chapter}[/{verses}]
 *
 * Conteúdo imutável: max-age=1y + ETag estável + 304 em revalidate.
 * Mudanças de contrato vivem em /v2 — aqui nunca quebra cliente.
 */
export async function handleV1Chapter(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  version: string,
  book: string,
  chapter: string,
  verseParam: string | undefined,
): Promise<Response> {
  const cacheKey = normalizeCacheKey(request);
  const cached = await cacheGet(cacheKey);
  if (cached) return serveFromCache(request, cached);

  try {
    const versionSlug = version.toLowerCase();
    const catalog = await getVersionCatalog(env);
    const versionData = catalog.bySlug.get(versionSlug);
    if (!versionData) {
      const didYouMean = closestString(versionSlug, catalog.bySlug.keys());
      return cachedErrorResponse(
        request,
        ctx,
        cacheKey,
        'VERSION_NOT_FOUND',
        didYouMean
          ? `Version "${version}" not found. Did you mean "${didYouMean}"?`
          : `Version "${version}" not found.`,
        didYouMean ? { didYouMean } : undefined,
      );
    }

    const bookData = getBookBySlug(book);
    if (!bookData) {
      const didYouMean = suggestBookSlug(book);
      return cachedErrorResponse(
        request,
        ctx,
        cacheKey,
        'BOOK_NOT_FOUND',
        didYouMean
          ? `Book "${book}" not found. Did you mean "${didYouMean}"?`
          : `Book "${book}" not found.`,
        didYouMean ? { didYouMean } : undefined,
      );
    }

    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookData.chapters) {
      return cachedErrorResponse(
        request,
        ctx,
        cacheKey,
        'INVALID_PARAMS',
        `Invalid chapter ${chapter}. ${bookData.names.en} has ${bookData.chapters} chapters.`,
        { maxChapters: bookData.chapters },
      );
    }

    const verses = await fetchChapterFromR2(env, versionSlug, bookData.id, chapterNum);
    if (!verses || verses.length === 0) {
      return cachedErrorResponse(
        request,
        ctx,
        cacheKey,
        'CHAPTER_NOT_FOUND',
        `Chapter not found: ${bookData.names.en} ${chapterNum} (${versionData.shortName}).`,
      );
    }

    const verseRange = parseVerseParam(verseParam);

    if (!verseRange) {
      const response = okResponse(
        {
          version: versionSlug,
          book: bookData.slugs.en,
          bookName: bookData.names.en,
          chapter: chapterNum,
          verses,
        },
        {
          total: verses.length,
          reference: `${bookData.names.en} ${chapterNum}`,
        },
      );
      const etag = etagFor(['v1', versionSlug, bookData.id, chapterNum]);
      const tagged = withEtag(request, response, etag);
      cachePut(ctx, cacheKey, tagged, 'v1-chapter');
      return maybeHead(request, tagged);
    }

    const selectedVerses = extractVerses(verses, verseRange.start, verseRange.end);
    if (!selectedVerses) {
      return cachedErrorResponse(
        request,
        ctx,
        cacheKey,
        'VERSE_NOT_FOUND',
        `Verse(s) out of range. ${bookData.names.en} ${chapterNum} has ${verses.length} verses.`,
        {
          chapter: chapterNum,
          maxVerses: verses.length,
          requestedStart: verseRange.start,
          requestedEnd: verseRange.end,
        },
      );
    }

    const text = selectedVerses.join(' ');
    const reference = formatReference(
      bookData,
      chapterNum,
      verseRange.start,
      verseRange.end,
      'en',
    );

    const response = okResponse(
      {
        version: versionSlug,
        book: bookData.slugs.en,
        bookName: bookData.names.en,
        chapter: chapterNum,
        verse: verseRange.start,
        verseEnd: verseRange.end,
        text,
        verses: selectedVerses,
      },
      {
        reference,
        total: selectedVerses.length,
      },
    );

    const etag = etagFor([
      'v1',
      versionSlug,
      bookData.id,
      chapterNum,
      verseRange.start,
      verseRange.end,
    ]);
    const tagged = withEtag(request, response, etag);
    cachePut(ctx, cacheKey, tagged, 'v1-verse');
    return maybeHead(request, tagged);
  } catch (error) {
    console.error('[v1/chapters] Error:', error);
    return maybeHead(request, errorResponse('INTERNAL_ERROR', 'Internal server error.'));
  }
}
