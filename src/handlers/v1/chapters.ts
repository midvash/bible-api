/**
 * GET /v1/{version}/{book}/{chapter}[/{verses}]
 *
 * Serializador fino no envelope { data, meta } sobre `resolveChapter`.
 * Conteúdo imutável: max-age=1y + ETag estável + 304 em revalidate.
 */

import type { Env } from '../../env';
import { etagFor, normalizeCacheKey, serveWithCache } from '../../lib/cache';
import { errorResponse, okResponse } from '../../lib/response';
import { resolveChapter } from '../../lib/resolve-chapter';

export function handleV1Chapter(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  version: string,
  book: string,
  chapter: string,
  verseParam: string | undefined,
): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'v1-chapter', async () => {
    try {
      const r = await resolveChapter(env, version, book, chapter, verseParam);

      switch (r.kind) {
        case 'version_not_found':
          return errorResponse(
            'VERSION_NOT_FOUND',
            r.didYouMean
              ? `Version "${version}" not found. Did you mean "${r.didYouMean}"?`
              : `Version "${version}" not found.`,
            r.didYouMean ? { didYouMean: r.didYouMean } : undefined,
          );
        case 'book_not_found':
          return errorResponse(
            'BOOK_NOT_FOUND',
            r.didYouMean
              ? `Book "${book}" not found. Did you mean "${r.didYouMean}"?`
              : `Book "${book}" not found.`,
            r.didYouMean ? { didYouMean: r.didYouMean } : undefined,
          );
        case 'invalid_chapter':
          return errorResponse(
            'INVALID_PARAMS',
            `Invalid chapter ${chapter}. ${r.book.names.en} has ${r.book.chapters} chapters.`,
            { maxChapters: r.book.chapters },
          );
        case 'chapter_not_found':
          return errorResponse(
            'CHAPTER_NOT_FOUND',
            `Chapter not found: ${r.book.names.en} ${r.chapterNum} (${r.version.shortName}).`,
          );
        case 'verse_out_of_range':
          return errorResponse(
            'VERSE_NOT_FOUND',
            `Verse(s) out of range. ${r.book.names.en} ${r.chapterNum} has ${r.maxVerses} verses.`,
            {
              chapter: r.chapterNum,
              maxVerses: r.maxVerses,
              requestedStart: r.range.start,
              requestedEnd: r.range.end,
            },
          );
      }

      if (!r.selection) {
        return {
          response: okResponse(
            {
              version: r.versionSlug,
              book: r.book.slugs.en,
              bookName: r.book.names.en,
              chapter: r.chapterNum,
              verses: r.verses,
            },
            { total: r.verses.length, reference: `${r.book.names.en} ${r.chapterNum}` },
          ),
          etag: etagFor(['v1', r.versionSlug, r.book.id, r.chapterNum]),
        };
      }

      return {
        response: okResponse(
          {
            version: r.versionSlug,
            book: r.book.slugs.en,
            bookName: r.book.names.en,
            chapter: r.chapterNum,
            verse: r.selection.range.start,
            verseEnd: r.selection.range.end,
            text: r.selection.text,
            verses: r.selection.verses,
          },
          { reference: r.selection.reference, total: r.selection.verses.length },
        ),
        etag: etagFor([
          'v1',
          r.versionSlug,
          r.book.id,
          r.chapterNum,
          r.selection.range.start,
          r.selection.range.end,
        ]),
      };
    } catch (error) {
      console.error('[v1/chapters] Error:', error);
      return errorResponse('INTERNAL_ERROR', 'Internal server error.');
    }
  });
}
