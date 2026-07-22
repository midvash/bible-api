/**
 * Parsing de referência bíblica em texto livre → partes cruas
 * (`{ bookQuery, chapter, verseStart, verseEnd }`).
 *
 * É o passo léxico que fica ANTES da resolução: separa a parte-livro do
 * `capítulo[:versículo[-versículo]]` final. NÃO conhece o catálogo de livros
 * nem valida se o livro existe — isso é responsabilidade de `lookupBook` /
 * `resolveChapter`, que recebem o `bookQuery` produzido aqui.
 *
 * Aceita as formas que clientes reais escrevem:
 *   "john 3:16"          → book "john",            cap 3,  v 16
 *   "genesis 1:1-3"      → book "genesis",         cap 1,  v 1..3
 *   "psalms 23"          → book "psalms",          cap 23, sem versículo
 *   "1 samuel 3:10"      → book "1 samuel",        cap 3,  v 10  (livro numerado)
 *   "song of solomon 2"  → book "song of solomon", cap 2
 *   "João 3:16-18"       → book "joão",            cap 3,  v 16..18 (qualquer idioma)
 *   "창세기 1:1"          → book "창세기",           cap 1,  v 1  (script nativo)
 *
 * `bookQuery` sai normalizado como os aliases que `book-lookup` já indexa:
 * lowercase, sem acentos, sem hífens/espaços/pontuação ("1 Samuel" → "1samuel",
 * "song of solomon" → "songofsolomon", "João" → "joao"). Scripts nativos
 * (창세기, 创世记, бытие) são preservados. `bookRaw` mantém o texto original
 * para mensagens de erro.
 */

import { normalizeLoose } from './suggest';

export interface ParsedReference {
  /** Parte-livro original, trimada (para mensagens de erro). */
  bookRaw: string;
  /** Parte-livro normalizada (loose) — pronta para `lookupBook`/`resolveChapter`. */
  bookQuery: string;
  chapter: number;
  /** null quando a referência é só do capítulo ("psalms 23"). */
  verseStart: number | null;
  /** Igual a `verseStart` num versículo único; maior num intervalo. */
  verseEnd: number | null;
}

// <parte-livro> <capítulo>[:<v-início>[-<v-fim>]]
// A parte-livro é lazy (`.+?`) e só cede o mínimo: o backtracking garante que
// o último bloco numérico da string vira capítulo/versículo, e não parte do
// nome ("1 samuel 3" → livro "1 samuel", cap 3).
const REFERENCE_RE = /^(.+?)[\s.:]*(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/;

/**
 * Parseia uma referência. Retorna `null` quando a string não tem a forma
 * `<livro> <capítulo>[...]`, quando o capítulo é < 1, ou quando um intervalo
 * de versículos é invertido (fim < início). NÃO garante que o livro exista.
 */
export function parseReference(input: string): ParsedReference | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const m = trimmed.match(REFERENCE_RE);
  if (!m) return null;

  const bookRaw = m[1].trim();
  if (!bookRaw) return null;

  const chapter = parseInt(m[2], 10);
  if (!Number.isFinite(chapter) || chapter < 1) return null;

  const verseStart = m[3] !== undefined ? parseInt(m[3], 10) : null;
  const verseEnd = m[4] !== undefined ? parseInt(m[4], 10) : verseStart;

  if (verseStart !== null && verseStart < 1) return null;
  if (verseStart !== null && verseEnd !== null && verseEnd < verseStart) return null;

  return {
    bookRaw,
    // NFC recompõe o Hangul que normalizeLoose (NFD) decompôs em jamo, casando
    // com os slugs compostos do índice; ASCII/cirílico passam inalterados.
    bookQuery: normalizeLoose(bookRaw).normalize('NFC'),
    chapter,
    verseStart,
    verseEnd,
  };
}

/**
 * Serializa a parte de versículo de uma referência parseada para o formato
 * que `resolveChapter` espera no `verseParam` ("16", "16-18", ou undefined).
 */
export function verseParamFrom(ref: ParsedReference): string | undefined {
  if (ref.verseStart === null) return undefined;
  if (ref.verseEnd === null || ref.verseEnd === ref.verseStart) return `${ref.verseStart}`;
  return `${ref.verseStart}-${ref.verseEnd}`;
}
