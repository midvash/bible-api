/**
 * Classifica a licença de uma versão a partir do texto livre de `copyright`
 * do catálogo, só pra exibir um selo curto na landing. Não é fonte de verdade
 * jurídica: o card linka pro `/v1/versions/{slug}`, que traz o texto completo.
 *
 * - `cc`: o texto cita uma licença Creative Commons entre parênteses,
 *   ex. "(CC BY-SA 4.0)" → selo "CC BY-SA 4.0".
 * - `pd`: domínio público (inclui CC0), sem ressalva de direitos recentes.
 * - `terms`: qualquer outra coisa (direitos reservados com permissão de uso
 *   gratuito, © recente sobre parte do texto, ou copyright ausente).
 */

export type LicenseKind =
  | { kind: 'pd' }
  | { kind: 'cc'; label: string }
  | { kind: 'terms' };

const CC_RE = /\((CC[ -]BY[A-Z -]*\d\.\d)\)/;
// © a partir de 1930 ou "reservados/reserved" = ainda há direitos sobre algo
// (ortografia atualizada, um dos Testamentos, edição moderna).
const RESERVED_RE = /reserved|reservados|©\s*(19[3-9]\d|20\d\d)/i;
const PD_RE =
  /public domain|\bCC0\b|domínio público|dominio público|domaine public|pubblico dominio|gemeinfrei/i;

export function licenseOf(copyright: string | undefined): LicenseKind {
  if (!copyright) return { kind: 'terms' };
  const cc = copyright.match(CC_RE);
  if (cc) return { kind: 'cc', label: cc[1].trim() };
  if (RESERVED_RE.test(copyright)) return { kind: 'terms' };
  if (PD_RE.test(copyright)) return { kind: 'pd' };
  return { kind: 'terms' };
}
