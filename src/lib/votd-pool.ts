/**
 * Pool de versículos para "Versículo do Dia" (VOTD).
 *
 * Servido por GET /votd e consumido pelo plugin WordPress. O index do dia é
 * `dayOfYear(UTC) % POOL.length`, então a sequência se repete a cada
 * `POOL.length` dias mas é estável para todos os usuários no mesmo dia UTC.
 *
 * Referências universais (livro, capítulo, versículo) — não dependem de
 * versão. Cada referência é resolvida em runtime contra a versão pedida.
 *
 * bookId segue o canon em ../books.ts (Gn=1, Ex=2, ..., Ap=66).
 */

export interface VotdReference {
  bookId: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

export const VOTD_POOL: VotdReference[] = [
  // Gênesis
  { bookId: 1, chapter: 1, verseStart: 1, verseEnd: 1 },
  { bookId: 1, chapter: 1, verseStart: 27, verseEnd: 27 },
  { bookId: 1, chapter: 50, verseStart: 20, verseEnd: 20 },
  // Êxodo
  { bookId: 2, chapter: 14, verseStart: 14, verseEnd: 14 },
  { bookId: 2, chapter: 20, verseStart: 12, verseEnd: 12 },
  // Deuteronômio
  { bookId: 5, chapter: 6, verseStart: 5, verseEnd: 5 },
  { bookId: 5, chapter: 31, verseStart: 6, verseEnd: 6 },
  // Josué
  { bookId: 6, chapter: 1, verseStart: 9, verseEnd: 9 },
  { bookId: 6, chapter: 24, verseStart: 15, verseEnd: 15 },
  // 1 Samuel
  { bookId: 9, chapter: 16, verseStart: 7, verseEnd: 7 },
  // Salmos
  { bookId: 19, chapter: 1, verseStart: 1, verseEnd: 2 },
  { bookId: 19, chapter: 19, verseStart: 14, verseEnd: 14 },
  { bookId: 19, chapter: 23, verseStart: 1, verseEnd: 1 },
  { bookId: 19, chapter: 27, verseStart: 1, verseEnd: 1 },
  { bookId: 19, chapter: 34, verseStart: 8, verseEnd: 8 },
  { bookId: 19, chapter: 37, verseStart: 4, verseEnd: 4 },
  { bookId: 19, chapter: 46, verseStart: 1, verseEnd: 1 },
  { bookId: 19, chapter: 46, verseStart: 10, verseEnd: 10 },
  { bookId: 19, chapter: 51, verseStart: 10, verseEnd: 10 },
  { bookId: 19, chapter: 56, verseStart: 3, verseEnd: 3 },
  { bookId: 19, chapter: 91, verseStart: 1, verseEnd: 2 },
  { bookId: 19, chapter: 100, verseStart: 4, verseEnd: 4 },
  { bookId: 19, chapter: 103, verseStart: 12, verseEnd: 12 },
  { bookId: 19, chapter: 118, verseStart: 24, verseEnd: 24 },
  { bookId: 19, chapter: 119, verseStart: 105, verseEnd: 105 },
  { bookId: 19, chapter: 121, verseStart: 1, verseEnd: 2 },
  { bookId: 19, chapter: 139, verseStart: 14, verseEnd: 14 },
  { bookId: 19, chapter: 143, verseStart: 8, verseEnd: 8 },
  // Provérbios
  { bookId: 20, chapter: 3, verseStart: 5, verseEnd: 6 },
  { bookId: 20, chapter: 4, verseStart: 23, verseEnd: 23 },
  { bookId: 20, chapter: 16, verseStart: 3, verseEnd: 3 },
  { bookId: 20, chapter: 17, verseStart: 17, verseEnd: 17 },
  { bookId: 20, chapter: 18, verseStart: 10, verseEnd: 10 },
  { bookId: 20, chapter: 27, verseStart: 17, verseEnd: 17 },
  // Eclesiastes
  { bookId: 21, chapter: 3, verseStart: 1, verseEnd: 1 },
  // Isaías
  { bookId: 23, chapter: 26, verseStart: 3, verseEnd: 3 },
  { bookId: 23, chapter: 40, verseStart: 31, verseEnd: 31 },
  { bookId: 23, chapter: 41, verseStart: 10, verseEnd: 10 },
  { bookId: 23, chapter: 43, verseStart: 2, verseEnd: 2 },
  { bookId: 23, chapter: 53, verseStart: 5, verseEnd: 5 },
  // Jeremias
  { bookId: 24, chapter: 29, verseStart: 11, verseEnd: 11 },
  { bookId: 24, chapter: 33, verseStart: 3, verseEnd: 3 },
  // Lamentações
  { bookId: 25, chapter: 3, verseStart: 22, verseEnd: 23 },
  // Miquéias
  { bookId: 33, chapter: 6, verseStart: 8, verseEnd: 8 },
  // Sofonias
  { bookId: 36, chapter: 3, verseStart: 17, verseEnd: 17 },
  // Mateus
  { bookId: 40, chapter: 5, verseStart: 16, verseEnd: 16 },
  { bookId: 40, chapter: 6, verseStart: 33, verseEnd: 33 },
  { bookId: 40, chapter: 11, verseStart: 28, verseEnd: 30 },
  { bookId: 40, chapter: 22, verseStart: 37, verseEnd: 39 },
  { bookId: 40, chapter: 28, verseStart: 19, verseEnd: 20 },
  // Marcos
  { bookId: 41, chapter: 12, verseStart: 30, verseEnd: 31 },
  // Lucas
  { bookId: 42, chapter: 6, verseStart: 31, verseEnd: 31 },
  // João
  { bookId: 43, chapter: 1, verseStart: 1, verseEnd: 1 },
  { bookId: 43, chapter: 3, verseStart: 16, verseEnd: 16 },
  { bookId: 43, chapter: 8, verseStart: 32, verseEnd: 32 },
  { bookId: 43, chapter: 14, verseStart: 6, verseEnd: 6 },
  { bookId: 43, chapter: 14, verseStart: 27, verseEnd: 27 },
  { bookId: 43, chapter: 15, verseStart: 13, verseEnd: 13 },
  { bookId: 43, chapter: 16, verseStart: 33, verseEnd: 33 },
  // Atos
  { bookId: 44, chapter: 1, verseStart: 8, verseEnd: 8 },
  // Romanos
  { bookId: 45, chapter: 5, verseStart: 8, verseEnd: 8 },
  { bookId: 45, chapter: 8, verseStart: 28, verseEnd: 28 },
  { bookId: 45, chapter: 8, verseStart: 38, verseEnd: 39 },
  { bookId: 45, chapter: 10, verseStart: 9, verseEnd: 9 },
  { bookId: 45, chapter: 12, verseStart: 2, verseEnd: 2 },
  { bookId: 45, chapter: 15, verseStart: 13, verseEnd: 13 },
  // 1 Coríntios
  { bookId: 46, chapter: 10, verseStart: 13, verseEnd: 13 },
  { bookId: 46, chapter: 13, verseStart: 4, verseEnd: 7 },
  { bookId: 46, chapter: 13, verseStart: 13, verseEnd: 13 },
  { bookId: 46, chapter: 15, verseStart: 58, verseEnd: 58 },
  // 2 Coríntios
  { bookId: 47, chapter: 5, verseStart: 17, verseEnd: 17 },
  { bookId: 47, chapter: 12, verseStart: 9, verseEnd: 9 },
  // Gálatas
  { bookId: 48, chapter: 2, verseStart: 20, verseEnd: 20 },
  { bookId: 48, chapter: 5, verseStart: 22, verseEnd: 23 },
  // Efésios
  { bookId: 49, chapter: 2, verseStart: 8, verseEnd: 9 },
  { bookId: 49, chapter: 4, verseStart: 32, verseEnd: 32 },
  { bookId: 49, chapter: 6, verseStart: 10, verseEnd: 11 },
  // Filipenses
  { bookId: 50, chapter: 4, verseStart: 6, verseEnd: 7 },
  { bookId: 50, chapter: 4, verseStart: 8, verseEnd: 8 },
  { bookId: 50, chapter: 4, verseStart: 13, verseEnd: 13 },
  { bookId: 50, chapter: 4, verseStart: 19, verseEnd: 19 },
  // Colossenses
  { bookId: 51, chapter: 3, verseStart: 23, verseEnd: 23 },
  // 1 Tessalonicenses
  { bookId: 52, chapter: 5, verseStart: 16, verseEnd: 18 },
  // 2 Timóteo
  { bookId: 55, chapter: 1, verseStart: 7, verseEnd: 7 },
  { bookId: 55, chapter: 3, verseStart: 16, verseEnd: 17 },
  // Hebreus
  { bookId: 58, chapter: 4, verseStart: 12, verseEnd: 12 },
  { bookId: 58, chapter: 11, verseStart: 1, verseEnd: 1 },
  { bookId: 58, chapter: 12, verseStart: 1, verseEnd: 2 },
  { bookId: 58, chapter: 13, verseStart: 8, verseEnd: 8 },
  // Tiago
  { bookId: 59, chapter: 1, verseStart: 5, verseEnd: 5 },
  { bookId: 59, chapter: 1, verseStart: 22, verseEnd: 22 },
  // 1 Pedro
  { bookId: 60, chapter: 5, verseStart: 7, verseEnd: 7 },
  // 1 João
  { bookId: 62, chapter: 1, verseStart: 9, verseEnd: 9 },
  { bookId: 62, chapter: 4, verseStart: 7, verseEnd: 8 },
  { bookId: 62, chapter: 4, verseStart: 19, verseEnd: 19 },
  // Apocalipse
  { bookId: 66, chapter: 3, verseStart: 20, verseEnd: 20 },
  { bookId: 66, chapter: 21, verseStart: 4, verseEnd: 4 },
];

/**
 * Retorna o dia-do-ano (1..366) em UTC para a data dada.
 */
export function dayOfYearUtc(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86_400_000);
}

/**
 * Escolhe a referência do dia (estável para o mesmo UTC date).
 */
export function pickVotdForDate(date: Date): VotdReference {
  const idx = dayOfYearUtc(date) % VOTD_POOL.length;
  return VOTD_POOL[idx];
}
