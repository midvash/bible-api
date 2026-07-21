import { BOOKS, type BookDefinition, type Locale } from '../books';
import type { Env } from '../env';
import type { ApiLocale } from './locale';

export interface VerseRange {
  start: number;
  end: number;
}

const BOOK_LOCALES: Locale[] = ['en', 'pt-br', 'es', 'fr', 'de', 'it', 'zh', 'ru', 'ko'];

/**
 * Lookups O(1) construídos no module scope.
 *
 * Antes: getBookBySlug fazia BOOKS.find(b => BOOK_LOCALES.some(l =>
 * b.slugs[l] === slug)) — O(66 × 9) por chamada. Agora ambos os mapas
 * são consultados em O(1).
 */
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

// Isolate cache (RAM) com LRU. Capítulo bíblico é imutável; 1h é seguro.
// Cap em 500 entries pra limitar RAM em isolates de longa duração.
const ISOLATE_TTL_MS = 60 * 60 * 1000;
const ISOLATE_MAX_ENTRIES = 500;
type ChapterEntry = { value: string[]; expiresAt: number };
const isolateChapterCache = new Map<string, ChapterEntry>();

function isolateGet(key: string): string[] | null {
  const entry = isolateChapterCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    isolateChapterCache.delete(key);
    return null;
  }
  // LRU touch: re-insere no fim
  isolateChapterCache.delete(key);
  isolateChapterCache.set(key, entry);
  return entry.value;
}

function isolateSet(key: string, value: string[]): void {
  if (isolateChapterCache.size >= ISOLATE_MAX_ENTRIES) {
    const oldest = isolateChapterCache.keys().next().value;
    if (oldest !== undefined) isolateChapterCache.delete(oldest);
  }
  isolateChapterCache.set(key, { value, expiresAt: Date.now() + ISOLATE_TTL_MS });
}

/**
 * Localiza um livro pelo slug em qualquer locale (9 idiomas suportados).
 * Lookup O(1) via BOOKS_BY_SLUG.
 */
export function getBookBySlug(slug: string): BookDefinition | null {
  // Slugs em escrita não-latina (ru/zh/ko) chegam URL-encoded do pathname;
  // os slugs em BOOKS são decodificados, então normalizamos antes do lookup.
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // pct-encoding malformado → cai pro slug bruto
  }
  const normalizedSlug = decoded.toLowerCase().trim();
  return BOOKS_BY_SLUG.get(normalizedSlug) ?? null;
}

/**
 * Busca um capítulo no R2.
 *
 * Caminho do R2: `{version}/{bookId}/{chapter}.json`
 * Estratégia: isolate RAM (~0ms) → R2 (~50ms).
 *
 * Cache API (na frente, gerido pelos handlers) absorve 99%+ dos hits;
 * R2 só é tocado em cold edge ou após purge.
 *
 * Suporta os 3 formatos legados de JSON do R2:
 *  1. array de strings (canônico)
 *  2. { verses: [{text}|string] }
 *  3. { "1": "...", "2": "..." } (objeto indexado por número de verso)
 */
export async function fetchChapterFromR2(
  env: Env,
  version: string,
  bookId: number,
  chapter: number,
): Promise<string[] | null> {
  const cacheKey = `chapter:${version}:${bookId}:${chapter}`;

  const memHit = isolateGet(cacheKey);
  if (memHit) return memHit;

  try {
    const key = `${version}/${bookId}/${chapter}.json`;
    const object = await env.R2_BUCKET.get(key);

    if (!object) {
      return null;
    }

    const text = await object.text();
    const data = JSON.parse(text);

    let verses: string[] = [];
    if (Array.isArray(data)) {
      verses = data;
    } else if (data && Array.isArray(data.verses)) {
      verses = data.verses.map((v: unknown) =>
        typeof v === 'string'
          ? v
          : v && typeof v === 'object' && 'text' in (v as Record<string, unknown>)
            ? String((v as { text: unknown }).text ?? '')
            : String(v ?? ''),
      );
    } else if (data && typeof data === 'object') {
      verses = Object.entries(data)
        .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
        .map(([, value]) => String(value));
    }

    isolateSet(cacheKey, verses);
    return verses;
  } catch (error) {
    console.error(`[R2] Error fetching chapter: ${cacheKey}`, error);
    return null;
  }
}

/**
 * Parseia o segmento de versículo da URL ("16" ou "16-20").
 */
export function parseVerseParam(verseParam: string | undefined): VerseRange | null {
  if (!verseParam) return null;

  const verseMatch = verseParam.match(/^(\d+)(?:-(\d+))?$/);
  if (!verseMatch) return null;

  const start = parseInt(verseMatch[1], 10);
  const end = verseMatch[2] ? parseInt(verseMatch[2], 10) : start;

  if (isNaN(start) || start < 1 || isNaN(end) || end < start) {
    return null;
  }

  return { start, end };
}

/**
 * Retorna o slice de versículos correspondente ao intervalo [start, end].
 */
export function extractVerses(
  verses: string[],
  verseStart: number,
  verseEnd: number,
): string[] | null {
  if (verseStart < 1 || verseStart > verses.length) return null;
  if (verseEnd > verses.length) return null;
  if (verseEnd < verseStart) return null;

  return verses.slice(verseStart - 1, verseEnd);
}

/**
 * Formata uma referência bíblica humana ("John 3:16" ou "John 3:16-18").
 */
export function formatReference(
  book: BookDefinition,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  locale: ApiLocale = 'en',
): string {
  const bookName = book.names[locale] || book.names['en'];

  if (verseEnd === verseStart) {
    return `${bookName} ${chapter}:${verseStart}`;
  }

  return `${bookName} ${chapter}:${verseStart}-${verseEnd}`;
}
