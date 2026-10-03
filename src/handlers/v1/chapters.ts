/**
 * GET /v1/{version}/{book}/{chapter}[/{verses}][?preview=N]
 *
 * Serializador fino no envelope { data, meta } sobre `resolveChapter`.
 * Conteúdo imutável: max-age=1y + ETag estável + 304 em revalidate.
 *
 * Capítulo inteiro espelha o shape de versículo (`text`, `verse`, `verseEnd`
 * junto de `verses[]`) — consumidores leem `data.text` sem se importar se a
 * referência tinha versículo. `?preview=N` (só capítulo inteiro) trunca o
 * `text` em ~N chars no fim de versículo e omite `verses[]` — payload de
 * tooltip em vez de Salmos 119 inteiro.
 */

import type { Env } from '../../env';
import { etagFor, normalizeCacheKey, serveWithCache } from '../../lib/cache';
import { errorResponse, okResponse } from '../../lib/response';
import { resolveChapter } from '../../lib/resolve-chapter';
import { parsePreviewParam, parseVerseParam, previewOfChapter } from '../../lib/chapter';

export function handleV1Chapter(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  version: string,
  book: string,
  chapter: string,
  verseParam: string | undefined,
): Promise<Response> {
  // `?preview` só vale para capítulo inteiro (sem segmento de versículo) e entra
  // na chave já clampado — o mesmo N que trunca o corpo.
  const preview =
    verseParam === undefined
      ? parsePreviewParam(new URL(request.url).searchParams.get('preview'))
      : null;

  return serveWithCache(request, ctx, normalizeCacheKey(request, { preview }), 'v1-chapter', async () => {
    try {
      // Segmento de versículo inválido ("abc") serve o capítulo inteiro.
      const r = await resolveChapter(env, version, book, parseInt(chapter, 10), parseVerseParam(verseParam));

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
              ? `Book "${r.bookDecoded}" not found. Did you mean "${r.didYouMean}"?`
              : `Book "${r.bookDecoded}" not found.`,
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
        const reference = `${r.book.names.en} ${r.chapterNum}`;

        if (preview) {
          const p = previewOfChapter(r.verses, preview);
          return {
            response: okResponse(
              {
                version: r.versionSlug,
                book: r.book.slugs.en,
                bookName: r.book.names.en,
                chapter: r.chapterNum,
                verse: 1,
                verseEnd: p.verseEnd,
                text: p.text,
              },
              { total: r.verses.length, reference, truncated: p.truncated, copyright: r.version.copyright },
            ),
            etag: etagFor(['v1', r.versionSlug, r.book.id, r.chapterNum, 'p', preview, 'cr']),
          };
        }

        return {
          response: okResponse(
            {
              version: r.versionSlug,
              book: r.book.slugs.en,
              bookName: r.book.names.en,
              chapter: r.chapterNum,
              verse: 1,
              verseEnd: r.verses.length,
              text: r.verses.join(' '),
              verses: r.verses,
            },
            { total: r.verses.length, reference, copyright: r.version.copyright },
          ),
          // 'c2': o shape ganhou text/verse/verseEnd — com o ETag antigo,
          // clientes revalidando levariam 304 e nunca veriam os campos novos.
          etag: etagFor(['v1', r.versionSlug, r.book.id, r.chapterNum, 'c2', 'cr']),
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
          {
            reference: r.selection.reference,
            total: r.selection.verses.length,
            copyright: r.version.copyright,
          },
        ),
        etag: etagFor([
          'v1',
          r.versionSlug,
          r.book.id,
          r.chapterNum,
          r.selection.range.start,
          r.selection.range.end,
          // 'cr': meta ganhou copyright; sem bump o 304 esconderia o campo.
          'cr',
        ]),
      };
    } catch (error) {
      console.error('[v1/chapters] Error:', error);
      return errorResponse('INTERNAL_ERROR', 'Internal server error.');
    }
  });
}
