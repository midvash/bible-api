import { describe, expect, it } from 'vitest';
import { resolveChapter } from '../src/lib/resolve-chapter';
import { lookupBook } from '../src/lib/book-lookup';
import type { Env } from '../src/env';

const JOHN_ID = lookupBook('john').book!.id;
const JOHN3 = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'For God so loved the world…'];

const CATALOG = [
  {
    slug: 'kjv',
    name: 'King James Version',
    shortName: 'KJV',
    language: 'en',
    hasOldTestament: true,
    hasNewTestament: true,
    totalBooks: 66,
    totalChapters: 1189,
  },
];

/** Env fake: R2 com catálogo + João 3 em kjv. */
const env = {
  R2_BUCKET: {
    async get(key: string) {
      if (key === 'catalog/versions.json') {
        return { json: async () => CATALOG };
      }
      if (key === `kjv/${JOHN_ID}/3.json`) {
        return { text: async () => JSON.stringify(JOHN3) };
      }
      return null;
    },
  },
} as unknown as Env;

describe('resolveChapter', () => {
  it('resolve capítulo inteiro', async () => {
    const r = await resolveChapter(env, 'KJV', 'john', '3', undefined);
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.versionSlug).toBe('kjv');
    expect(r.book.slugs.en).toBe('john');
    expect(r.chapterNum).toBe(3);
    expect(r.verses).toHaveLength(16);
    expect(r.selection).toBeNull();
  });

  it('resolve versículo único com texto e referência', async () => {
    const r = await resolveChapter(env, 'kjv', 'john', '3', '16');
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.selection?.text).toBe('For God so loved the world…');
    expect(r.selection?.reference).toBe('John 3:16');
  });

  it('resolve livro por alias sem hífen e locale alternativo', async () => {
    const r = await resolveChapter(env, 'kjv', 'joao', '3', '15-16');
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.selection?.verses).toEqual(['v15', 'For God so loved the world…']);
    expect(r.selection?.reference).toBe('John 3:15-16');
  });

  it('versão inexistente, com did-you-mean', async () => {
    const r = await resolveChapter(env, 'kjw', 'john', '3', undefined);
    expect(r).toMatchObject({ kind: 'version_not_found', didYouMean: 'kjv' });
  });

  it('livro inexistente, com did-you-mean', async () => {
    const r = await resolveChapter(env, 'kjv', 'johm', '3', undefined);
    expect(r).toMatchObject({ kind: 'book_not_found', didYouMean: 'john' });
  });

  it('capítulo fora do range do livro', async () => {
    const r = await resolveChapter(env, 'kjv', 'john', '99', undefined);
    expect(r.kind).toBe('invalid_chapter');
  });

  it('capítulo sem dados no R2', async () => {
    const r = await resolveChapter(env, 'kjv', 'john', '4', undefined);
    expect(r.kind).toBe('chapter_not_found');
  });

  it('versículo fora do range do capítulo', async () => {
    const r = await resolveChapter(env, 'kjv', 'john', '3', '17-99');
    expect(r).toMatchObject({ kind: 'verse_out_of_range', maxVerses: 16 });
  });
});
