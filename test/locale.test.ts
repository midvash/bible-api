import { describe, expect, it } from 'vitest';
import { normalizeLocale } from '../src/lib/locale';

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
