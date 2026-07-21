/**
 * Resolução de capítulo — o pipeline único atrás das rotas de conteúdo
 * bíblico (`/{version}/{book}/{chapter}[/{verses}]`, legado e /v1).
 *
 * Recebe os 4 segmentos crus da URL e devolve um `ChapterResolution`
 * discriminado. Os handlers são serializadores finos por cima: escolhem
 * envelope e texto de mensagem, nunca re-implementam a resolução.
 *
 * Esconde: catálogo de versões (R2), lookup de livro (aliases, decode),
 * fetch do capítulo (R2 + cache de isolate), validação de intervalo de
 * versículos e sugestões "did you mean".
 */

import type { Env } from '../env';
import type { BookDefinition } from '../books';
import { getVersionCatalog, type VersionDefinition } from '../versions';
import { lookupBook } from './book-lookup';
import { closestString } from './suggest';
import {
  extractVerses,
  fetchChapterFromR2,
  formatReference,
  parseVerseParam,
  type VerseRange,
} from './chapter';

export type ChapterResolution =
  | {
      kind: 'ok';
      versionSlug: string;
      version: VersionDefinition;
      book: BookDefinition;
      chapterNum: number;
      /** Todos os versículos do capítulo. */
      verses: string[];
      /** Presente apenas quando a URL pediu versículo/intervalo. */
      selection: {
        range: VerseRange;
        verses: string[];
        text: string;
        /** Referência humana em inglês ("John 3:16-18"). */
        reference: string;
      } | null;
    }
  | { kind: 'version_not_found'; versionParam: string; didYouMean: string | null }
  | { kind: 'book_not_found'; bookParam: string; didYouMean: string | null }
  | { kind: 'invalid_chapter'; chapterParam: string; book: BookDefinition }
  | { kind: 'chapter_not_found'; versionSlug: string; version: VersionDefinition; book: BookDefinition; chapterNum: number }
  | {
      kind: 'verse_out_of_range';
      book: BookDefinition;
      chapterNum: number;
      maxVerses: number;
      range: VerseRange;
    };

export async function resolveChapter(
  env: Env,
  versionParam: string,
  bookParam: string,
  chapterParam: string,
  verseParam: string | undefined,
): Promise<ChapterResolution> {
  const versionSlug = versionParam.toLowerCase();
  const catalog = await getVersionCatalog(env);
  const version = catalog.bySlug.get(versionSlug);
  if (!version) {
    return {
      kind: 'version_not_found',
      versionParam,
      didYouMean: closestString(versionSlug, catalog.bySlug.keys()),
    };
  }

  const { book, didYouMean } = lookupBook(bookParam);
  if (!book) {
    return { kind: 'book_not_found', bookParam, didYouMean: didYouMean ?? null };
  }

  const chapterNum = parseInt(chapterParam, 10);
  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
    return { kind: 'invalid_chapter', chapterParam, book };
  }

  const verses = await fetchChapterFromR2(env, versionSlug, book.id, chapterNum);
  if (!verses || verses.length === 0) {
    return { kind: 'chapter_not_found', versionSlug, version, book, chapterNum };
  }

  const range = parseVerseParam(verseParam);
  if (!range) {
    return { kind: 'ok', versionSlug, version, book, chapterNum, verses, selection: null };
  }

  const selected = extractVerses(verses, range.start, range.end);
  if (!selected) {
    return {
      kind: 'verse_out_of_range',
      book,
      chapterNum,
      maxVerses: verses.length,
      range,
    };
  }

  return {
    kind: 'ok',
    versionSlug,
    version,
    book,
    chapterNum,
    verses,
    selection: {
      range,
      verses: selected,
      text: selected.join(' '),
      reference: formatReference(book, chapterNum, range.start, range.end, 'en'),
    },
  };
}
