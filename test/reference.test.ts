import { describe, expect, it } from 'vitest';
import { parseReference } from '../src/lib/reference';
import { lookupBook } from '../src/lib/book-lookup';

describe('parseReference', () => {
  it('versículo único', () => {
    expect(parseReference('john 3:16')).toMatchObject({
      bookQuery: 'john',
      chapter: 3,
      verseStart: 16,
      verseEnd: 16,
    });
  });

  it('intervalo de versículos', () => {
    expect(parseReference('genesis 1:1-3')).toMatchObject({
      bookQuery: 'genesis',
      chapter: 1,
      verseStart: 1,
      verseEnd: 3,
    });
  });

  it('capítulo inteiro (sem versículo)', () => {
    expect(parseReference('psalms 23')).toMatchObject({
      bookQuery: 'psalms',
      chapter: 23,
      verseStart: null,
      verseEnd: null,
    });
  });

  it('livro numerado com espaço', () => {
    expect(parseReference('1 samuel 3:10')).toMatchObject({
      bookRaw: '1 samuel',
      bookQuery: '1samuel',
      chapter: 3,
      verseStart: 10,
    });
  });

  it('livro multi-palavra', () => {
    expect(parseReference('song of solomon 2:1')).toMatchObject({
      bookQuery: 'songofsolomon',
      chapter: 2,
      verseStart: 1,
    });
  });

  it('acentos preservados no bookRaw, dobrados no bookQuery', () => {
    const r = parseReference('João 3:16-18');
    expect(r).toMatchObject({ bookRaw: 'João', bookQuery: 'joao', chapter: 3, verseStart: 16, verseEnd: 18 });
  });

  it('script nativo (Hangul recomposto em NFC)', () => {
    const r = parseReference('창세기 1:1')!;
    expect(r.bookQuery).toBe('창세기'.normalize('NFC'));
    expect(r).toMatchObject({ chapter: 1, verseStart: 1 });
  });

  it('espaços ao redor do hífen do intervalo', () => {
    expect(parseReference('romans 8:38 - 39')).toMatchObject({ verseStart: 38, verseEnd: 39 });
  });

  it('rejeita string vazia', () => {
    expect(parseReference('   ')).toBeNull();
  });

  it('rejeita referência sem número', () => {
    expect(parseReference('genesis')).toBeNull();
  });

  it('rejeita intervalo invertido', () => {
    expect(parseReference('john 3:18-16')).toBeNull();
  });

  it('rejeita capítulo zero', () => {
    expect(parseReference('john 0:1')).toBeNull();
  });
});

describe('abreviação de texto livre', () => {
  it('"Jo" é João, "Jó" segue Jó', () => {
    expect(parseReference('jo 3:16')?.bookQuery).toBe('joao');
    expect(parseReference('Jo. 3:16')?.bookQuery).toBe('joao');
    expect(parseReference('Jó 1:1')?.bookQuery).toBe('jo');
  });
});


describe('referência com nome, singular ou apelido', () => {
  // O que importa é chegar no livro certo pelo lookup.
  const bookOf = (ref: string) => lookupBook(parseReference(ref)!.bookQuery).book?.slugs.en;

  it('aceita o singular de Salmos nos idiomas que o usam', () => {
    expect(bookOf('Salmo 23:4')).toBe('psalms');
    expect(bookOf('Psalm 23')).toBe('psalms');
    expect(bookOf('Psaume 23')).toBe('psalms');
  });

  it('aceita nomes por extenso e apelidos de outros idiomas', () => {
    expect(bookOf('Jn 3:16')).toBe('john');
    expect(bookOf('1 Mose 1:1')).toBe('genesis');
    expect(bookOf('Song of Songs 2')).toBe('song-of-solomon');
    expect(bookOf('Иоанна 3:16')).toBe('john');
  });

  it('não muda o que já resolvia', () => {
    expect(bookOf('João 3:16')).toBe('john');
    expect(bookOf('Jo 3:16')).toBe('john');
    expect(bookOf('Jó 1:1')).toBe('job');
    expect(bookOf('1 Samuel 3')).toBe('1-samuel');
  });
});
