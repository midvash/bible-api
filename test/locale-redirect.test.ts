import { describe, expect, it } from 'vitest';
import { preferredLocale, rootRedirectLocale } from '../src/landing/locale-redirect';

const LOCALES = ['en', 'pt-br', 'es', 'de', 'fr', 'it', 'zh', 'ru', 'ko'] as const;
const req = (headers: Record<string, string>) => new Request('https://x/', { headers });

describe('idioma do navegador na raiz', () => {
  it('casa as variantes regionais com os idiomas da landing', () => {
    expect(preferredLocale('pt-BR,pt;q=0.9,en;q=0.8', LOCALES)).toBe('pt-br');
    expect(preferredLocale('pt-PT', LOCALES)).toBe('pt-br');
    expect(preferredLocale('es-419,es;q=0.9', LOCALES)).toBe('es');
    expect(preferredLocale('zh-CN', LOCALES)).toBe('zh');
    expect(preferredLocale('ko-KR,ko;q=0.9', LOCALES)).toBe('ko');
  });

  it('respeita o peso q e ignora idioma de fora', () => {
    expect(preferredLocale('nl;q=1,de;q=0.5,fr;q=0.8', LOCALES)).toBe('fr');
    expect(preferredLocale('ja,nl', LOCALES)).toBeNull();
    expect(preferredLocale(null, LOCALES)).toBeNull();
  });

  it('redireciona só quando o idioma não é inglês, e o cookie manda', () => {
    expect(rootRedirectLocale(req({ 'Accept-Language': 'de-DE' }), LOCALES)).toBe('de');
    expect(rootRedirectLocale(req({ 'Accept-Language': 'en-US' }), LOCALES)).toBeNull();
    expect(rootRedirectLocale(req({}), LOCALES)).toBeNull();
    expect(rootRedirectLocale(req({ 'Accept-Language': 'pt-BR', Cookie: 'a=1; mv_lang=en' }), LOCALES)).toBeNull();
    expect(rootRedirectLocale(req({ 'Accept-Language': 'en', Cookie: 'mv_lang=ru' }), LOCALES)).toBe('ru');
  });
});
