/**
 * Sugestão de slug pra erros 404 auto-corrigíveis ("did you mean").
 *
 * Motivação (issue midvash#1420): clientes de terceiro erram o slug de
 * formas previsíveis (hífen faltando, acento, typo) e entram em loop de
 * 404. Devolver a grafia correta no corpo do erro deixa o dev do cliente
 * consertar o próprio lado na primeira request.
 *
 * Custo: só roda no caminho de MISS de um 404 (a resposta é cacheada
 * depois), então a busca linear por distância de edição é irrelevante.
 */

import { BOOKS, type Locale } from '../books';

const SUGGEST_LOCALES: Locale[] = ['en', 'pt-br', 'es', 'fr', 'de', 'it', 'zh', 'ru', 'ko'];

/** Lowercase, sem acentos, só alfanumérico — `2_Samuel ` → `2samuel`. */
function normalizeLoose(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** Distância de Levenshtein com corte: devolve Infinity se passar de `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return Infinity;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return Infinity;
    prev = curr;
  }
  return prev[b.length] <= max ? prev[b.length] : Infinity;
}

/**
 * Candidato mais próximo de `input` (após normalização frouxa), com no
 * máximo `maxDistance` edições. Empate → primeiro candidato da lista.
 */
export function closestString(
  input: string,
  candidates: Iterable<string>,
  maxDistance = 2,
): string | null {
  const needle = normalizeLoose(input);
  if (!needle) return null;
  let best: string | null = null;
  let bestDist = maxDistance + 1;
  for (const candidate of candidates) {
    const dist = editDistance(needle, normalizeLoose(candidate), maxDistance);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
      if (dist === 0) break;
    }
  }
  return best;
}

// Índice frouxo → slug original (canônico primeiro, então nunca sombreado).
const LOOSE_BOOK_SLUGS: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const book of BOOKS) {
    for (const locale of SUGGEST_LOCALES) {
      const slug = book.slugs[locale];
      if (!slug) continue;
      const loose = normalizeLoose(slug);
      if (loose && !map.has(loose)) map.set(loose, slug);
    }
  }
  return map;
})();

const ALL_BOOK_SLUGS: readonly string[] = [...new Set(LOOSE_BOOK_SLUGS.values())];

/**
 * Sugere o slug correto pra um slug de livro que não resolveu.
 * 1º match exato após normalização frouxa (`2_samuel`, `são-joão`);
 * senão, vizinho a ≤2 edições (`2-samule`). `null` se nada plausível.
 */
export function suggestBookSlug(slug: string): string | null {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // pct-encoding malformado → segue com o valor bruto
  }
  const exact = LOOSE_BOOK_SLUGS.get(normalizeLoose(decoded));
  if (exact) return exact;
  return closestString(decoded, ALL_BOOK_SLUGS);
}
