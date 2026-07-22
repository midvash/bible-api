/**
 * Conteúdo de capítulo: fetch no R2 (com cache de isolate) + parsing e
 * formatação de referências. Lookup de livro por slug vive em
 * `lib/book-lookup.ts`; a resolução completa de URL → capítulo vive em
 * `lib/resolve-chapter.ts`.
 */

import type { BookDefinition } from '../books';
import type { Env } from '../env';
import type { ApiLocale } from './locale';

export interface VerseRange {
  start: number;
  end: number;
}

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

// Clamp do `?preview=` — piso evita previews inúteis (menores que 1 verso
// curto), teto limita o custo de uma URL variável no edge cache.
export const PREVIEW_MIN_CHARS = 40;
export const PREVIEW_MAX_CHARS = 2000;

/**
 * Parseia (e canoniza) o query param `?preview=N` de capítulo.
 *
 * Retorna o N clampado em [PREVIEW_MIN_CHARS, PREVIEW_MAX_CHARS], ou `null`
 * para ausente/inválido (inválido = ignorado, serve o capítulo completo).
 * Usado tanto pelo handler quanto pela cache key — os dois PRECISAM
 * concordar, senão o edge cache fragmenta ou colide variantes.
 */
export function parsePreviewParam(raw: string | null): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  if (n < 1) return null;
  return Math.min(Math.max(n, PREVIEW_MIN_CHARS), PREVIEW_MAX_CHARS);
}

/**
 * Trunca um capítulo em ~maxChars, sempre terminando em fim de versículo.
 * O primeiro versículo entra sempre (o preview nunca é vazio), mesmo que
 * ultrapasse maxChars.
 */
export function previewOfChapter(
  verses: string[],
  maxChars: number,
): { text: string; verseEnd: number; truncated: boolean } {
  let text = verses[0] ?? '';
  let verseEnd = 1;
  for (let i = 1; i < verses.length; i++) {
    if (text.length + 1 + verses[i].length > maxChars) break;
    text += ' ' + verses[i];
    verseEnd = i + 1;
  }
  return { text, verseEnd, truncated: verseEnd < verses.length };
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
