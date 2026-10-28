/**
 * Idioma do navegador na raiz da landing (`/`, inglês).
 *
 * Quem abre `/` com `Accept-Language` de um dos idiomas da landing (que não
 * seja inglês) vai pra `/pt-br`, `/es`… com 302, nunca 301: redirect de idioma
 * com 301 fica preso no cache do navegador e da CDN (lição do midvash.com).
 * Quem escolheu um idioma no seletor ganha o cookie `mv_lang`, que vale mais
 * que o navegador (escolheu English, fica em `/`). Sem `Accept-Language`
 * (robôs, Googlebot), fica em inglês.
 *
 * A resposta de `/` passa a depender do pedido, então sai `private` e com
 * `Vary: Accept-Language, Cookie`: nem o Workers Cache nem a CDN guardam uma
 * versão pra servir a outro idioma. As páginas `/pt-br` etc. seguem públicas.
 */

export const LANG_COOKIE = 'mv_lang';

/** Headers da resposta de `/` (o redirect e a página em inglês). */
export const ROOT_NEGOTIATED_HEADERS = {
  'Cache-Control': 'private, no-store',
  Vary: 'Accept-Language, Cookie',
} as const;

/** Idioma pedido em `Accept-Language`, na ordem de preferência (q). */
export function preferredLocale<L extends string>(
  header: string | null,
  locales: readonly L[],
): L | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag: tag.trim(), q: q ? Number(q.slice(2)) : 1, i };
    })
    .filter((x) => x.tag && x.tag !== '*' && x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    const match =
      base === 'pt'
        ? locales.find((l) => l === 'pt-br')
        : locales.find((l) => l === tag || l === base);
    if (match) return match;
  }
  return null;
}

/** Idioma guardado pela escolha manual no seletor, se for um dos da landing. */
export function cookieLocale<L extends string>(
  cookieHeader: string | null,
  locales: readonly L[],
): L | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, value] = part.trim().split('=');
    if (name === LANG_COOKIE) return locales.find((l) => l === value) ?? null;
  }
  return null;
}

/**
 * Pra onde mandar quem abriu `/`. `null` = fica no inglês. Cookie primeiro,
 * depois o navegador.
 */
export function rootRedirectLocale<L extends string>(
  request: Request,
  locales: readonly L[],
): L | null {
  const chosen =
    cookieLocale(request.headers.get('Cookie'), locales) ??
    preferredLocale(request.headers.get('Accept-Language'), locales);
  return chosen && chosen !== 'en' ? chosen : null;
}

/**
 * Script do seletor de idioma: grava a escolha no cookie (1 ano) antes de
 * navegar, pra `/` respeitar quem escolheu outro idioma, inclusive o inglês.
 */
export const LANG_COOKIE_SCRIPT = `document.querySelectorAll('a.lang-item[hreflang]').forEach(function(a){
  a.addEventListener('click', function(){
    document.cookie = '${LANG_COOKIE}=' + a.getAttribute('hreflang') + '; path=/; max-age=31536000; SameSite=Lax; Secure';
  });
});`;
