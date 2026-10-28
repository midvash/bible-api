/**
 * Similaridade de strings para erros 404 auto-corrigíveis ("did you mean").
 *
 * Motivação (issue midvash#1420): clientes de terceiro erram o slug de
 * formas previsíveis (hífen faltando, acento, typo) e entram em loop de
 * 404. Devolver a grafia correta no corpo do erro deixa o dev do cliente
 * consertar o próprio lado na primeira request.
 *
 * Módulo puro e genérico: quem conhece os candidatos é o caller
 * (lib/book-lookup para livros, handlers de capítulo para versões).
 */

/** Lowercase, sem acentos, só alfanumérico — `2_Samuel ` → `2samuel`. */
export function normalizeLoose(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * Distância de edição OSA (Damerau restrita: Levenshtein + troca de duas
 * letras vizinhas custando 1) com corte: devolve Infinity se passar de `max`.
 * Sem a troca, "jhon" ficava a 2 de "john" e de "job", e o empate dava "job".
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return Infinity;
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let prevMin = 0;
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d = Math.min(d, prev2[j - 2] + 1);
      }
      curr[j] = d;
      if (d < rowMin) rowMin = d;
    }
    // A troca olha duas linhas atrás: só dá pra cortar quando as duas passaram.
    if (rowMin > max && prevMin > max) return Infinity;
    prevMin = rowMin;
    prev2 = prev;
    prev = curr;
  }
  return prev[b.length] <= max ? prev[b.length] : Infinity;
}

/**
 * Candidato mais próximo de `input` (após normalização frouxa), com no
 * máximo `maxDistance` edições. Empate → o de tamanho mais perto do pedido;
 * persistindo, o primeiro candidato da lista.
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
  let bestLenGap = Infinity;
  for (const candidate of candidates) {
    const normalized = normalizeLoose(candidate);
    const dist = editDistance(needle, normalized, maxDistance);
    const lenGap = Math.abs(normalized.length - needle.length);
    if (dist < bestDist || (dist === bestDist && lenGap < bestLenGap)) {
      bestDist = dist;
      bestLenGap = lenGap;
      best = candidate;
      if (dist === 0) break;
    }
  }
  return best;
}
