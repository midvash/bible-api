import { describe, expect, it } from 'vitest';
import { displayLocale, normalizeLocale } from '../src/lib/locale';

describe('normalizeLocale', () => {
  it('aceita os 9 locales canônicos', () => {
    for (const l of ['en', 'pt-br', 'es', 'fr', 'de', 'it', 'zh', 'ru', 'ko']) {
      expect(normalizeLocale(l)).toBe(l);
    }
  });

  it('agrupa as variantes de português em pt-br', () => {
    expect(normalizeLocale('pt')).toBe('pt-br');
    expect(normalizeLocale('pt-pt')).toBe('pt-br');
    expect(normalizeLocale('PT-BR')).toBe('pt-br');
  });

  it('cai em en para ausente ou desconhecido', () => {
    expect(normalizeLocale(null)).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
    expect(normalizeLocale('klingon')).toBe('en');
  });
});

describe('displayLocale', () => {
  it('usa o idioma da versão quando não vem ?locale', () => {
    expect(displayLocale('pt-br', null)).toBe('pt-br');
    expect(displayLocale('pt', undefined)).toBe('pt-br');
    expect(displayLocale('es', '')).toBe('es');
  });

  it('cai em inglês quando o idioma da versão não é um dos 9', () => {
    expect(displayLocale('he', null)).toBe('en');
    expect(displayLocale('ja', null)).toBe('en');
  });

  it('?locale manda sobre o idioma da versão', () => {
    expect(displayLocale('pt-br', 'en')).toBe('en');
    expect(displayLocale('en', 'pt')).toBe('pt-br');
  });
});
