import { describe, expect, it } from 'vitest';
import { defaultVotdVersion } from '../src/handlers/votd';
import { normalizeLocale } from '../src/lib/locale';

/** Atalho: resolve o default como o handler faz (raw + locale normalizado). */
function resolve(language: string): string {
  const raw = language.toLowerCase().trim();
  return defaultVotdVersion(raw, normalizeLocale(raw));
}

describe('defaultVotdVersion', () => {
  it('9 locales de UI só usam versão livre', () => {
    expect(resolve('en')).toBe('kjv');
    expect(resolve('pt-br')).toBe('almeida-livre');
    expect(resolve('es')).toBe('rvr1909');
    expect(resolve('fr')).toBe('lsg');
    expect(resolve('de')).toBe('luth1912');
    expect(resolve('it')).toBe('nri');
    expect(resolve('zh')).toBe('cuvs');
    expect(resolve('ru')).toBe('synodal');
    expect(resolve('ko')).toBe('kor');
  });

  it('colapsa variantes de português', () => {
    expect(resolve('pt')).toBe('almeida-livre'); // pt → pt-br
    expect(resolve('pt-pt')).toBe('almeida-livre');
  });

  it('resolve idiomas novos para versões que cobrem o pool no R2', () => {
    expect(resolve('la')).toBe('vulg');
    expect(resolve('ar')).toBe('svd');
    expect(resolve('nl')).toBe('dutch1917');
    expect(resolve('uk')).toBe('kp');
  });

  it('idiomas sem conteúdo que cubra o pool caem em kjv', () => {
    expect(resolve('gr')).toBe('kjv'); // só NT/LXX no idioma
    expect(resolve('he')).toBe('kjv'); // livres em hebraico são só AT
    expect(resolve('sw')).toBe('kjv'); // só NT no idioma
    expect(resolve('sr')).toBe('kjv'); // skd 100% sem conteúdo no R2
    expect(resolve('ja')).toBe('kjv'); // kgy com buracos no pool
    expect(resolve('id')).toBe('kjv'); // indonesian sem Salmos
  });

  it('idioma desconhecido cai no fallback global', () => {
    expect(resolve('xx')).toBe('kjv');
    expect(resolve('')).toBe('kjv');
  });
});
