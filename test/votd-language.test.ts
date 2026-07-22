import { describe, expect, it } from 'vitest';
import { defaultVotdVersion } from '../src/handlers/votd';
import { normalizeLocale } from '../src/lib/locale';

/** Atalho: resolve o default como o handler faz (raw + locale normalizado). */
function resolve(language: string): string {
  const raw = language.toLowerCase().trim();
  return defaultVotdVersion(raw, normalizeLocale(raw));
}

describe('defaultVotdVersion', () => {
  it('mantém os defaults históricos dos 9 locales de UI', () => {
    expect(resolve('en')).toBe('kjv');
    expect(resolve('pt-br')).toBe('nvt');
    expect(resolve('es')).toBe('ntv');
    expect(resolve('fr')).toBe('lsg');
    expect(resolve('de')).toBe('luth1912');
    expect(resolve('it')).toBe('nri');
    expect(resolve('zh')).toBe('cuvs');
    expect(resolve('ru')).toBe('synodal');
    expect(resolve('ko')).toBe('kor');
  });

  it('colapsa variantes de português', () => {
    expect(resolve('pt')).toBe('nvt'); // pt → pt-br
    expect(resolve('pt-pt')).toBe('bpt'); // token cru vence antes de normalizar
  });

  it('resolve idiomas novos para versões completas próprias', () => {
    expect(resolve('ja')).toBe('kgy');
    expect(resolve('he')).toBe('mh');
    expect(resolve('la')).toBe('vulg');
    expect(resolve('ar')).toBe('svd');
    expect(resolve('nl')).toBe('dutch1917');
    expect(resolve('uk')).toBe('kp');
  });

  it('idiomas sem conteúdo completo/publicado caem em kjv', () => {
    expect(resolve('gr')).toBe('kjv'); // só NT/LXX no idioma
    expect(resolve('sw')).toBe('kjv'); // só NT no idioma
    expect(resolve('sr')).toBe('kjv'); // skd sem conteúdo no R2
  });

  it('idioma desconhecido cai no fallback global', () => {
    expect(resolve('xx')).toBe('kjv');
    expect(resolve('')).toBe('kjv');
  });
});
