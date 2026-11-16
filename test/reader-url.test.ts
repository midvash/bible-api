import { describe, expect, it } from 'vitest';
import { lookupBook } from '../src/lib/book-lookup';
import { readerUrl } from '../src/lib/reader-url';

const book = (slug: string) => lookupBook(slug).book!;

describe('readerUrl', () => {
  it('versão em inglês: sem prefixo de idioma, slug em inglês', () => {
    expect(readerUrl('bsb', 'en', book('romans'), 8)).toBe('https://midvash.com/bsb/romans/8');
  });

  it('versão num dos 9 idiomas: prefixo e slug do livro nesse idioma', () => {
    expect(readerUrl('almeida-livre', 'pt-br', book('1-thessalonians'), 4, 13)).toBe(
      'https://midvash.com/pt-br/almeida-livre/1-tessalonicenses/4#v=13',
    );
    expect(readerUrl('pdt', 'es', book('romans'), 8, 28, 39)).toBe('https://midvash.com/es/pdt/romanos/8#v=28-39');
  });

  it('escrita não latina vai codificada, como o site publica', () => {
    expect(readerUrl('synodal', 'ru', book('psalms'), 23)).toBe(
      'https://midvash.com/ru/synodal/%D0%BF%D1%81%D0%B0%D0%BB%D1%82%D0%B8%D1%80%D1%8C/23',
    );
  });

  it('idioma fora dos 9: sem prefixo, slug em inglês', () => {
    expect(readerUrl('svd', 'ar', book('romans'), 8, 1, 1)).toBe('https://midvash.com/svd/romans/8#v=1');
  });
});
