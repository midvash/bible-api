/**
 * Chave dos plugins (WordPress, EmDash, extensão do Chrome).
 *
 * Com `X-Midvash-Plugin-Key` igual ao secret `PLUGIN_KEY`, as rotas de sempre
 * servem o catálogo completo do midvash.com: versão com direitos devolve o
 * próprio texto, não a troca pela livre. O limite de 1 capítulo por
 * referência vale igual (o parser não aceita intervalo entre capítulos).
 */

export const PLUGIN_KEY_HEADER = 'X-Midvash-Plugin-Key';

/** Mesmo Cache-Control do METADATA_HEADERS (1 dia). */
const ONE_DAY = 'public, max-age=86400, s-maxage=86400';

/** Comparação em tempo constante: a chave não vaza pelo tempo de resposta. */
export function isPluginKey(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/**
 * Headers finais de toda resposta:
 *
 * - `Vary: X-Midvash-Plugin-Key` em todas. O Workers Cache (na frente do
 *   worker) e qualquer CDN guardam uma variante por valor do header: o público
 *   (sem header) nunca recebe o texto protegido, e o plugin nunca recebe a
 *   resposta pública já cacheada da mesma URL.
 * - No modo plugin, nada é imutável: versão com direitos pode sair do ar, então
 *   `immutable` de 1 ano vira 1 dia.
 */
export function applyPluginHeaders(response: Response, plugin: boolean): Response {
  const out = new Response(response.body, response);
  const vary = out.headers.get('Vary');
  if (!vary?.toLowerCase().includes(PLUGIN_KEY_HEADER.toLowerCase())) {
    out.headers.set('Vary', vary ? `${vary}, ${PLUGIN_KEY_HEADER}` : PLUGIN_KEY_HEADER);
  }
  if (plugin && out.headers.get('Cache-Control')?.includes('immutable')) {
    out.headers.set('Cache-Control', ONE_DAY);
  }
  return out;
}
