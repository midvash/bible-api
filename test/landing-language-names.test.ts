import { describe, expect, it } from 'vitest';
import { TRANSLATIONS } from '../src/landing/i18n';

describe('nomes de idioma da landing', () => {
  const enKeys = Object.keys(TRANSLATIONS.en.versions.languageNames).sort();

  it('cobre os idiomas novos do catálogo (não cai no código cru)', () => {
    for (const code of ['ceb', 'hne', 'mg', 'tw', 'yo']) expect(enKeys).toContain(code);
  });

  it('todo locale da landing nomeia os mesmos idiomas que o inglês', () => {
    for (const [locale, t] of Object.entries(TRANSLATIONS)) {
      expect(Object.keys(t.versions.languageNames).sort(), locale).toEqual(enKeys);
    }
  });
});
