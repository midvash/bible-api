/**
 * Rodapé igual ao do midvash.com: logo, as mesmas colunas de links, as redes
 * sociais do idioma e o copyright. Os dados vêm de `site-footer-data.ts`
 * (gerado a partir do site). Mesmo arquivo na API e no MCP.
 *
 * As cores são as variáveis da página (`--primary`, `--text-muted`, `--border`,
 * `--bg-card`), que as duas landings definem com a paleta do site.
 */
import { SITE_FOOTER, type FooterColumn, type SiteFooterData } from './site-footer-data';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Ícones Phosphor (duotone), os mesmos do rodapé do site.
const SOCIAL_ICONS: Record<SiteFooterData['social'][number]['kind'], string> = {
  instagram:
    '<path d="M176,32H80A48,48,0,0,0,32,80v96a48,48,0,0,0,48,48h96a48,48,0,0,0,48-48V80A48,48,0,0,0,176,32ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2"/><path d="M176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm64-84a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"/>',
  facebook:
    '<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"/>',
  youtube:
    '<path d="M226.59,71.53a16,16,0,0,0-9.63-11C183.48,47.65,128,48,128,48s-55.48-.35-89,12.58a16,16,0,0,0-9.63,11C27.07,80.54,24,98.09,24,128s3.07,47.46,5.41,56.47A16,16,0,0,0,39,195.42C72.52,208.35,128,208,128,208s55.48.35,89-12.58a16,16,0,0,0,9.63-10.95c2.34-9,5.41-26.56,5.41-56.47S228.93,80.54,226.59,71.53ZM112,160V96l48,32Z" opacity="0.2"/><path d="M164.44,121.34l-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V111l25.58,17ZM234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,39.88,131,40,128,40s-57.56-.12-91.84,13.12a24,24,0,0,0-14.49,16.4C19.08,79.5,16,97.74,16,128s3.08,48.5,5.67,58.48a24,24,0,0,0,14.49,16.41C69,215.56,120.4,216,127.34,216h1.32c6.94,0,58.37-.44,91.18-13.11a24,24,0,0,0,14.49-16.41c2.59-10,5.67-28.22,5.67-58.48S236.92,79.5,234.33,69.52Zm-15.49,113a8,8,0,0,1-4.77,5.49c-31.65,12.22-85.48,12-86.12,12s-54.37.18-86-12a8,8,0,0,1-4.77-5.49C34.8,173.39,32,156.57,32,128s2.8-45.39,5.16-54.47A8,8,0,0,1,41.93,68C73.58,55.82,127.4,56,128.05,56s54.37-.18,86,12a8,8,0,0,1,4.77,5.49C221.2,82.61,224,99.43,224,128S221.2,173.39,218.84,182.47Z"/>',
  github:
    '<path d="M208,104v8a48,48,0,0,1-48,48H136a32,32,0,0,1,32,32v40H104V192a32,32,0,0,1,32-32H112a48,48,0,0,1-48-48v-8a49.28,49.28,0,0,1,8.51-27.3A51.92,51.92,0,0,1,76,32a52,52,0,0,1,43.83,24h32.34A52,52,0,0,1,196,32a51.92,51.92,0,0,1,3.49,44.7A49.28,49.28,0,0,1,208,104Z" opacity="0.2"/><path d="M208.3,75.68A59.74,59.74,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58,58,0,0,0,208.3,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.76,41.76,0,0,1,200,104Z"/>',
};

function column(c: FooterColumn, twoCols = false): string {
  const title = c.href
    ? `<a href="${esc(c.href)}">${esc(c.title)}</a>`
    : esc(c.title);
  const links = c.links
    .map((l) => {
      const label = l.short
        ? `<strong>${esc(l.short)}</strong> ${esc(l.text)}`
        : esc(l.text);
      return `<li><a href="${esc(l.href)}">${label}</a></li>`;
    })
    .join('');
  return `<div class="sf-col"><p class="sf-title">${title}</p><ul${twoCols ? ' class="sf-two"' : ''}>${links}</ul></div>`;
}

/** `locale` no formato do site: `en`, `pt-br`, `es`… (cai no inglês). */
export function renderSiteFooter(locale: string): string {
  const f = SITE_FOOTER[locale] ?? SITE_FOOTER.en;
  const [inst, dev, apps, tools, alts, ot, nt, versions, study] = f.columns;
  const home = locale === 'en' ? 'https://midvash.com/' : `https://midvash.com/${locale}`;
  const social = f.social
    .map(
      (s) =>
        `<a href="${esc(s.href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.label)}"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">${SOCIAL_ICONS[s.kind]}</svg></a>`,
    )
    .join('');

  return `<footer class="sf">
  <div class="sf-inner">
    <nav class="sf-grid" aria-label="Midvash">
      <div class="sf-group">
        <div class="sf-col">
          <a class="sf-logo" href="${home}" aria-label="Midvash">
            <img class="sf-logo-light" src="https://midvash.com/brand/logo-midvash.svg" alt="Midvash" width="120" height="36" loading="lazy">
            <img class="sf-logo-dark" src="https://midvash.com/brand/logo-midvash-dark.svg" alt="" width="120" height="36" loading="lazy">
          </a>
          <p class="sf-blurb">${esc(f.blurb)}</p>
        </div>
        ${column(inst)}${column(dev)}${column(apps)}
      </div>
      <div class="sf-group">${column(tools)}${column(alts)}</div>
      <div class="sf-group">${column(ot, true)}</div>
      <div class="sf-group">${column(nt, true)}</div>
      <div class="sf-group">${column(versions)}${column(study)}</div>
    </nav>
    <div class="sf-bottom">
      <div class="sf-social">${social}</div>
      <p>${esc(f.copyright)}</p>
    </div>
  </div>
</footer>`;
}

export const SITE_FOOTER_CSS = `
.sf { background: var(--bg-card); border-top: 1px solid var(--border); padding: 64px 0 32px; }
.sf-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.sf-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; margin-bottom: 56px; }
@media (min-width: 640px) { .sf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1080px) { .sf-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.sf-group { display: flex; flex-direction: column; gap: 32px; }
.sf-logo { display: inline-block; margin-bottom: 12px; }
.sf-logo img { display: block; height: 36px; width: auto; }
.sf-logo-dark { display: none !important; }
@media (prefers-color-scheme: dark) {
  .sf-logo-light { display: none !important; }
  .sf-logo-dark { display: block !important; }
}
.sf-blurb { font-size: 12px; line-height: 1.6; color: var(--text-muted); }
.sf-title {
  margin: 0 0 16px; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.18em; color: var(--primary);
}
.sf-title a { color: inherit; text-decoration: none; }
.sf-title a:hover { color: var(--text); }
.sf ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.sf ul.sf-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
.sf li a {
  font-size: 12px; line-height: 1.5; color: var(--text-muted); text-decoration: none;
  transition: color 0.15s ease;
}
.sf li a:hover { color: var(--primary); }
.sf li strong { font-weight: 600; margin-right: 4px; }
.sf-bottom { border-top: 1px solid var(--border); padding-top: 40px; text-align: center; }
.sf-social { display: flex; justify-content: center; gap: 20px; margin-bottom: 16px; }
.sf-social a { color: var(--text-muted); display: inline-flex; transition: color 0.15s ease; }
.sf-social a:hover { color: var(--primary); }
.sf-bottom p { font-size: 12px; color: var(--text-muted); margin: 0; }
`;
