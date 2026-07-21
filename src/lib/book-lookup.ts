/**
 * Lookup de livro por slug — todo o caminho "slug → livro" vive aqui.
 *
 * Interface:
 *   - `lookupBook(slug)` → `{ book }` ou `{ book: null, didYouMean }`.
 *   - `BOOKS_BY_ID` — lookup O(1) por id (pool do VOTD referencia por id).
 *
 * A implementação esconde: decode de pct-encoding (slugs ru/zh/ko chegam
 * URL-encoded), normalização estrita (lowercase/trim), aliases sem hífen
 * (`2samuel`), normalização frouxa (acentos/pontuação) e a sugestão por
 * distância de edição ("did you mean").
 */

import { BOOKS, type BookDefinition, type Locale } from '../books';
import { closestString, normalizeLoose } from './suggest';

const BOOK_LOCALES: Locale[] = ['en', 'pt-br', 'es', 'fr', 'de', 'it', 'zh', 'ru', 'ko'];

export const BOOKS_BY_ID: ReadonlyMap<number, BookDefinition> = new Map(
  BOOKS.map((book) => [book.id, book]),
);

const BOOKS_BY_SLUG: ReadonlyMap<string, BookDefinition> = (() => {
  const map = new Map<string, BookDefinition>();
  // 1º passe: slugs canônicos (com hífen) têm prioridade sobre qualquer alias.
  for (const book of BOOKS) {
    for (const locale of BOOK_LOCALES) {
      const slug = book.slugs[locale];
      if (slug && !map.has(slug)) {
        map.set(slug, book);
      }
    }
  }
  // 2º passe: aliases sem hífen (`2samuel`, `songofsolomon`). Clientes reais
  // montam a URL sem o hífen e viram um loop de 404 (issue midvash#1420);
  // aceitar o alias transforma esses misses em 200 imutável cacheado no edge.
  for (const book of BOOKS) {
    for (const locale of BOOK_LOCALES) {
      const alias = book.slugs[locale]?.replace(/-/g, '');
      if (alias && !map.has(alias)) {
        map.set(alias, book);
      }
    }
  }
  return map;
})();

// Índice frouxo → slug original (canônico primeiro, então nunca sombreado).
const LOOSE_BOOK_SLUGS: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const book of BOOKS) {
    for (const locale of BOOK_LOCALES) {
      const slug = book.slugs[locale];
      if (!slug) continue;
      const loose = normalizeLoose(slug);
      if (loose && !map.has(loose)) map.set(loose, slug);
    }
  }
  return map;
})();

const ALL_BOOK_SLUGS: readonly string[] = [...new Set(LOOSE_BOOK_SLUGS.values())];

/** Decode tolerante: pct-encoding malformado cai para o valor bruto. */
function safeDecode(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export type BookLookup =
  | { book: BookDefinition; didYouMean?: undefined }
  | { book: null; didYouMean: string | null };

/**
 * Resolve um slug (em qualquer um dos 9 locales, com ou sem hífen) para um
 * livro. Quando não resolve, tenta sugerir a grafia correta: 1º match exato
 * após normalização frouxa (`2_samuel`, `são-joão`); senão, vizinho a ≤2
 * edições (`2-samule`); senão `didYouMean: null`.
 *
 * A sugestão só roda no caminho de miss de um 404 (resposta depois é
 * cacheada), então a busca linear por distância de edição é irrelevante.
 */
export function lookupBook(slug: string): BookLookup {
  const decoded = safeDecode(slug);
  const book = BOOKS_BY_SLUG.get(decoded.toLowerCase().trim()) ?? null;
  if (book) return { book };

  const exact = LOOSE_BOOK_SLUGS.get(normalizeLoose(decoded));
  return { book: null, didYouMean: exact ?? closestString(decoded, ALL_BOOK_SLUGS) };
}

/** Nome do slug apresentável em mensagens de erro (decodificado). */
export function displaySlug(slug: string): string {
  return safeDecode(slug);
}
