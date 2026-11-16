/**
 * Os 9 locales oficiais do Midvash (packages/i18n) — fonte única para API,
 * slugs de livro e landing. A ordem importa: é a prioridade de slug no
 * lookup de livro (um slug repetido entre locales resolve pelo primeiro).
 */
export const LOCALES = ['en', 'pt-br', 'es', 'fr', 'de', 'it', 'zh', 'ru', 'ko'] as const;

export type ApiLocale = (typeof LOCALES)[number];

const VALID_LOCALES: ReadonlySet<string> = new Set(LOCALES);

/**
 * Normaliza o query param `locale` para o formato canônico usado nos
 * dados. Aceita "pt" como sinônimo de "pt-br". Locales desconhecidos
 * caem em "en".
 */
export function normalizeLocale(locale: string | null | undefined): ApiLocale {
  if (!locale) return 'en';
  const v = locale.toLowerCase().trim();
  if (v === 'pt' || v === 'pt-br' || v === 'pt-pt') return 'pt-br';
  return VALID_LOCALES.has(v) ? (v as ApiLocale) : 'en';
}

/**
 * Idioma em que a resposta escreve o nome do livro (`bookName`, `reference`).
 * Sem `?locale`, segue o idioma da versão: a NVA responde "Romanos 8:28".
 * Versão de idioma fora dos 9 (he, ja…) cai em inglês, que é o que havia antes.
 */
export function displayLocale(
  versionLanguage: string,
  localeParam: string | null | undefined,
): ApiLocale {
  return localeParam?.trim() ? normalizeLocale(localeParam) : normalizeLocale(versionLanguage);
}
