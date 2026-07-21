import { describe, expect, it } from 'vitest';
import { displaySlug, lookupBook } from '../src/lib/book-lookup';

describe('lookupBook', () => {
  it('resolve slug canônico em qualquer locale', () => {
    expect(lookupBook('john').book?.slugs.en).toBe('john');
    expect(lookupBook('joao').book?.slugs.en).toBe('john');
    expect(lookupBook('2-samuel').book?.slugs.en).toBe('2-samuel');
  });

  it('resolve alias sem hífen (issue midvash#1420)', () => {
    expect(lookupBook('2samuel').book?.slugs.en).toBe('2-samuel');
    expect(lookupBook('songofsolomon').book?.slugs.en).toBe('song-of-solomon');
  });

  it('resolve slug URL-encoded (escritas não-latinas)', () => {
    expect(lookupBook(encodeURIComponent('约翰福音')).book?.slugs.en).toBe('john');
  });

  it('não resolve com acento/underscore, mas sugere a grafia certa', () => {
    const r1 = lookupBook('2_samuel');
    expect(r1.book).toBeNull();
    expect(r1.didYouMean).toBe('2-samuel');

    const r2 = lookupBook('gênesis');
    expect(r2.book).toBeNull();
    expect(r2.didYouMean).toBeTruthy();
  });

  it('sugere vizinho por distância de edição para typo', () => {
    const r = lookupBook('2-samule');
    expect(r.book).toBeNull();
    // Vizinho mais próximo em qualquer locale: '2-samuele' (italiano) está a
    // 1 edição, mais perto que '2-samuel' (2 edições).
    expect(r.didYouMean).toBe('2-samuele');
  });

  it('devolve didYouMean null quando nada é plausível', () => {
    const r = lookupBook('xxxxxxxxxxxx');
    expect(r.book).toBeNull();
    expect(r.didYouMean).toBeNull();
  });

  it('tolera pct-encoding malformado', () => {
    expect(lookupBook('%E0%A4%A').book).toBeNull();
    expect(displaySlug('%E0%A4%A')).toBe('%E0%A4%A');
  });
});
