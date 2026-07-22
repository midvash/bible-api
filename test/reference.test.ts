import { describe, expect, it } from 'vitest';
import { parseReference, verseParamFrom } from '../src/lib/reference';

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

  it('verseParamFrom serializa as três formas', () => {
    expect(verseParamFrom(parseReference('psalms 23')!)).toBeUndefined();
    expect(verseParamFrom(parseReference('john 3:16')!)).toBe('16');
    expect(verseParamFrom(parseReference('genesis 1:1-3')!)).toBe('1-3');
  });
});
