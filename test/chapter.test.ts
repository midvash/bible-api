import { describe, expect, it } from 'vitest';
import { extractVerses, formatReference, parseVerseParam } from '../src/lib/chapter';
import { lookupBook } from '../src/lib/book-lookup';

describe('parseVerseParam', () => {
  it('parseia versículo único e intervalo', () => {
    expect(parseVerseParam('16')).toEqual({ start: 16, end: 16 });
    expect(parseVerseParam('16-20')).toEqual({ start: 16, end: 20 });
  });

  it('rejeita formatos inválidos', () => {
    expect(parseVerseParam(undefined)).toBeNull();
    expect(parseVerseParam('abc')).toBeNull();
    expect(parseVerseParam('0')).toBeNull();
    expect(parseVerseParam('20-16')).toBeNull();
    expect(parseVerseParam('16-')).toBeNull();
  });
});

describe('extractVerses', () => {
  const verses = ['v1', 'v2', 'v3', 'v4', 'v5'];

  it('fatia o intervalo pedido (1-indexed, inclusivo)', () => {
    expect(extractVerses(verses, 2, 4)).toEqual(['v2', 'v3', 'v4']);
    expect(extractVerses(verses, 5, 5)).toEqual(['v5']);
  });

  it('devolve null fora do range', () => {
    expect(extractVerses(verses, 0, 2)).toBeNull();
    expect(extractVerses(verses, 4, 6)).toBeNull();
    expect(extractVerses(verses, 6, 6)).toBeNull();
  });
});

describe('formatReference', () => {
  const john = lookupBook('john').book!;

  it('formata versículo único e intervalo', () => {
    expect(formatReference(john, 3, 16, 16)).toBe('John 3:16');
    expect(formatReference(john, 3, 16, 18)).toBe('John 3:16-18');
  });

  it('usa o nome localizado, com fallback para en', () => {
    expect(formatReference(john, 3, 16, 16, 'pt-br')).toBe('João 3:16');
  });
});
