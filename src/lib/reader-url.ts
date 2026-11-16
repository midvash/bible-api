/**
 * Link do leitor do midvash.com no endereço canônico do trecho.
 *
 * O site publica cada versão no idioma dela: a NVA em
 * `/pt-br/nva/salmos/23`, a PDT em `/es/pdt/romanos/8`. O endereço sem idioma
 * (`/nva/psalms/23`) responde, mas com a interface em inglês. Versão em
 * inglês, ou num idioma fora dos 9 do site, fica sem prefixo e com o slug em
 * inglês. Versículo vai na âncora `#v=`, como o site redireciona.
 */

import type { BookDefinition } from '../books';
import { normalizeLocale } from './locale';

export function readerUrl(
  versionSlug: string,
  versionLanguage: string,
  book: BookDefinition,
  chapter: number,
  verseStart?: number,
  verseEnd?: number,
): string {
  const locale = normalizeLocale(versionLanguage);
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const slug = encodeURIComponent(book.slugs[locale] || book.slugs.en);
  const base = `https://midvash.com${prefix}/${versionSlug}/${slug}/${chapter}`;
  if (verseStart === undefined) return base;
  const end = verseEnd !== undefined && verseEnd > verseStart ? `-${verseEnd}` : '';
  return `${base}#v=${verseStart}${end}`;
}
