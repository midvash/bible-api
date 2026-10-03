/**
 * Resolução de capítulo — o pipeline único atrás das rotas de conteúdo
 * bíblico (`/{version}/{book}/{chapter}[/{verses}]`, legado e /v1).
 *
 * Recebe versão e livro crus (como o cliente escreveu) e capítulo/intervalo
 * já parseados — o parse é do chamador (URL: `parseInt` + `parseVerseParam`;
 * texto livre: `parseReference`) — e devolve um `ChapterResolution`
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
import { extractVerses, fetchChapterFromR2, formatReference, type VerseRange } from './chapter';

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
  | { kind: 'version_not_found'; didYouMean: string | null }
  | {
      kind: 'book_not_found';
      /** Livro como o cliente escreveu, sem pct-encoding (pra mensagem). */
      bookDecoded: string;
      didYouMean: string | null;
    }
  | { kind: 'invalid_chapter'; book: BookDefinition }
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
  chapterNum: number,
  /** null = capítulo inteiro. */
  range: VerseRange | null,
): Promise<ChapterResolution> {
  const catalog = await getVersionCatalog(env);
  const found = catalog.lookup(versionParam);
  if (!found) {
    return { kind: 'version_not_found', didYouMean: catalog.suggest(versionParam) };
  }
  // Slug efetivo: versão que saiu da API chega aqui já trocada pela livre.
  const { slug: versionSlug, version } = found;

  const lookup = lookupBook(bookParam);
  if (!lookup.book) {
    return { kind: 'book_not_found', bookDecoded: lookup.decoded, didYouMean: lookup.didYouMean };
  }
  const { book } = lookup;

  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
    return { kind: 'invalid_chapter', book };
  }

  const verses = await fetchChapterFromR2(env, versionSlug, book.id, chapterNum);
  if (!verses || verses.length === 0) {
    return { kind: 'chapter_not_found', versionSlug, version, book, chapterNum };
  }

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
