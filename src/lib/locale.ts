/**
 * Locales suportados nos endpoints que retornam dados localizados
 * (lookup de versões/livros, formatReference, etc.). Alinhado com os 9
 * locales oficiais do Midvash (packages/i18n).
 */
export type ApiLocale =
  | 'en'
  | 'pt-br'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'zh'
  | 'ru'
  | 'ko';

const VALID_LOCALES = new Set<ApiLocale>([
  'en',
  'pt-br',
  'es',
  'fr',
  'de',
  'it',
  'zh',
  'ru',
  'ko',
]);

/**
 * Normaliza o query param `locale` para o formato canônico usado nos
 * dados. Aceita "pt" como sinônimo de "pt-br". Locales desconhecidos
 * caem em "en".
 */
export function normalizeLocale(locale: string | null | undefined): ApiLocale {
  if (!locale) return 'en';
  const v = locale.toLowerCase().trim();
  if (v === 'pt' || v === 'pt-br' || v === 'pt-pt') return 'pt-br';
  return VALID_LOCALES.has(v as ApiLocale) ? (v as ApiLocale) : 'en';
}
