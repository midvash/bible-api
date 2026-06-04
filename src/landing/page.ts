import type { VersionDefinition } from '../versions';
import {
  TRANSLATIONS,
  SUPPORTED_LOCALES,
  pathForLocale,
  type Locale,
  type Translations,
  type EndpointDoc,
} from './i18n';

const SITE_URL = 'https://api.midvash.com';

const ALTERNATE_NAMES: Partial<Record<Locale, string>> = {
  en: 'Midvash Bible API',
  'pt-br': 'API da Bíblia Midvash',
  es: 'API de la Biblia Midvash',
  fr: 'API de la Bible Midvash',
  de: 'Midvash Bibel-API',
  it: 'API della Bibbia Midvash',
  zh: 'Midvash 圣经 API',
  ru: 'API Библии Midvash',
  ko: 'Midvash 성경 API',
};

const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: 'English',
  'pt-br': 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  zh: '中文',
  ru: 'Русский',
  ko: '한국어',
};

// Mapeia locale → slug do SVG em midvash.com/flags/. Mesmas bandeiras
// redondas usadas no Header do app principal (apps/web/components/Header.tsx).
const LOCALE_FLAGS: Record<Locale, string> = {
  en: 'us',
  'pt-br': 'br',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  zh: 'cn',
  ru: 'ru',
  ko: 'kr',
};

const FLAG_BASE_URL = 'https://midvash.com/flags';

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  'pt-br': 'pt_BR',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  zh: 'zh_CN',
  ru: 'ru_RU',
  ko: 'ko_KR',
};

const SELECT_LANGUAGE_LABEL: Record<Locale, string> = {
  en: 'Select language',
  'pt-br': 'Selecionar idioma',
  es: 'Seleccionar idioma',
  fr: 'Choisir la langue',
  de: 'Sprache wählen',
  it: 'Seleziona la lingua',
  zh: '选择语言',
  ru: 'Выбрать язык',
  ko: '언어 선택',
};

const GLOBE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a112.1,112.1,0,0,1-26,45A112,112,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a112.1,112.1,0,0,1,26-45A112,112,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z"/></svg>';

const CARET_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>';

function langSwitcherMarkup(currentLocale: Locale, ariaLabel: string): string {
  const items = SUPPORTED_LOCALES.map((l) => {
    const isActive = l === currentLocale;
    return `<li role="none"><a href="${pathForLocale(l)}" class="lang-item${isActive ? ' is-active' : ''}" hreflang="${l}" role="menuitem"${isActive ? ' aria-current="page"' : ''}><img class="lang-flag" src="${FLAG_BASE_URL}/${LOCALE_FLAGS[l]}.svg" alt="" width="20" height="20" loading="lazy"><span class="lang-name">${escapeHtml(LOCALE_NATIVE_NAMES[l])}</span></a></li>`;
  }).join('');

  return `<div class="lang-switcher" data-lang-switcher>
    <button type="button" class="lang-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="lang-menu" aria-label="${escapeHtml(ariaLabel)}">
      <span class="lang-trigger-icon">${GLOBE_ICON}</span>
      <span class="lang-trigger-label">${escapeHtml(LOCALE_NATIVE_NAMES[currentLocale])}</span>
      <span class="lang-trigger-caret">${CARET_ICON}</span>
    </button>
    <ul id="lang-menu" class="lang-menu" role="menu" hidden>
      ${items}
    </ul>
  </div>`;
}

const LANG_SWITCHER_SCRIPT = `(function(){
  document.querySelectorAll('[data-lang-switcher]').forEach(function(root){
    var btn = root.querySelector('.lang-trigger');
    var menu = root.querySelector('.lang-menu');
    if(!btn||!menu) return;
    function close(){ btn.setAttribute('aria-expanded','false'); menu.hidden = true; }
    function open(){ btn.setAttribute('aria-expanded','true'); menu.hidden = false; }
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      if(menu.hidden) open(); else close();
    });
    document.addEventListener('click', function(e){
      if(!root.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') close();
    });
  });
})();`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function endpointId(ep: EndpointDoc): string {
  return ep.path.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

/**
 * SVG oficial do Midvash — mesmo de apps/web/public/icons/icon-midvash.svg.
 * Três hexágonos honey (glow / base / deep) — embarcado inline.
 */
function midvashLogo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" aria-hidden="true">
    <path d="M100,16 L138.105,38 L138.105,82 L100,104 L61.895,82 L61.895,38 Z" fill="#F0CE8A"/>
    <path d="M61.895,59.56 L100,81.56 L100,125.56 L61.895,147.56 L23.79,125.56 L23.79,81.56 Z" fill="#E8B45A"/>
    <path d="M138.105,59.56 L176.21,81.56 L176.21,125.56 L138.105,147.56 L100,125.56 L100,81.56 Z" fill="#B17027"/>
  </svg>`;
}

/**
 * Ícones SVG do ecossistema (footer). Inline pra evitar requests externos.
 * Phosphor Icons paths (duotone weight não fica bem em SVG estático,
 * então uso regular weight com currentColor).
 */
const ECOSYSTEM_ICONS: Record<'reader' | 'api' | 'mcp' | 'wordpress', string> = {
  reader:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></svg>',
  api:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M251.31,180.69l-30-30a16,16,0,0,0-22.63,0L194,155.32V123.31a47.81,47.81,0,0,0-14.06-34l-43.87-43.87L141,40.49a16,16,0,0,0,0-22.63L131.31,8.18a16,16,0,0,0-22.62,0L74.34,42.52a16,16,0,0,0,0,22.63L84,74.83,40.13,118.69a47.81,47.81,0,0,0,0,67.88l29.3,29.3a47.81,47.81,0,0,0,67.88,0L181.17,172l9.69,9.69a16,16,0,0,0,22.62,0l34.34-34.35A16,16,0,0,0,251.31,180.69ZM120,40H136v16H120Zm-32,32H120V88H88ZM68,116l24-24,52,52-24,24Zm120,52L132.69,112.69a16,16,0,0,0-22.62,0L72.69,150.06a16,16,0,0,0,0,22.63L92,192H40V40H88Z"/></svg>',
  mcp:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16ZM104,128a12,12,0,1,1-12-12A12,12,0,0,1,104,128Zm72,0a12,12,0,1,1-12-12A12,12,0,0,1,176,128Z"/></svg>',
  wordpress:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24ZM43,98.65l32.05,87.78A88.16,88.16,0,0,1,43,98.65Zm87.59,89.34L102.34,109.78l27.07,1.21,21.6,59.4ZM89.62,97.32a44.86,44.86,0,0,1-7.62-1.36c12.18-1.62,24.07-2.64,32.93-3a51.12,51.12,0,0,1,9.43,2.07c.93,3.06,1.49,5.55,1.74,8.21Zm105.81-19a55.43,55.43,0,0,0-3.5,8.36c-1.4,4-3.27,9.43-3.27,16.83,0,3.7,1.42,9.7,4.66,17.7,7.66,18.93,12.91,32.05,12.91,52.79a86.86,86.86,0,0,1-3.27,23.92L181.42,127c8-12.13,12.6-23.45,12.6-32.41a64.55,64.55,0,0,0-1.91-15.27Zm-25.59,21.78c0,2.43.65,5,1.42,8.21H115.81L116,98.91c4.93-2.13,16.13-3.06,21.7-3.06a36.39,36.39,0,0,1,9,1.16Zm-65.55-39.4a87.84,87.84,0,0,1,93.07,11.93c-1.6.06-9.79.5-19,4.79-3.27,1.5-9.16,4.81-9.16,12.85,0,3,1.21,5.63,3.06,9.49a26.36,26.36,0,0,1,2.34,5.34A78.31,78.31,0,0,1,128,89.69c-19.81,0-37.6,2.16-39.62,2.41-1.55-3.69-1.66-5.5-1.66-7,0-7.43,5.34-9.84,11.61-12.43,3.74-1.55,8.18-2.66,8.18-2.66l-1.51-7.41,1-2A86.41,86.41,0,0,1,128,40,86.86,86.86,0,0,1,168.59,49.69ZM69.85,80.13c1.13-.16,5.79-3.83,11.78-3.83,9.65,0,17.32,7.16,17.32,16,0,9.13-9.07,15-19.13,17.16C66.79,113.49,57.34,123.05,57,123.36L52.55,107A89,89,0,0,1,69.85,80.13ZM128,216A87.85,87.85,0,0,1,77.34,200l54.94-79.81L153.5,193A88,88,0,0,1,128,216Z"/></svg>',
};

const INSTAGRAM_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"/></svg>';

function renderEndpointCard(ep: EndpointDoc, t: Translations): string {
  const id = endpointId(ep);
  const params = ep.params ?? [];
  const hasParams = params.length > 0;

  const paramsTable = hasParams
    ? `
    <div class="ep-params">
      <div class="ep-params-label">${escapeHtml(t.endpoints.paramsLabel)}</div>
      <table>
        <tbody>
          ${params
            .map(
              (p) => `
            <tr>
              <td><code class="param-name">${escapeHtml(p.name)}</code></td>
              <td><span class="param-type">${escapeHtml(p.type)}</span></td>
              <td><span class="param-flag${p.required ? ' is-required' : ''}">${escapeHtml(p.required ? t.endpoints.paramRequired : t.endpoints.paramOptional)}</span></td>
              <td>${escapeHtml(p.description)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>`
    : '';

  return `
    <article class="endpoint" id="ep-${id}">
      <header class="ep-header">
        <span class="ep-method">${ep.method}</span>
        <code class="ep-path">${escapeHtml(ep.path)}</code>
      </header>
      <p class="ep-desc">${escapeHtml(ep.description)}</p>
      ${paramsTable}
      <div class="ep-tryit">
        <button class="run-btn" data-call="${escapeHtml(ep.exampleCall)}" data-target="resp-${id}">
          <span class="run-icon">▶</span>
          <span class="run-label">${escapeHtml(t.endpoints.runBtn)}</span>
          <code class="run-call">${escapeHtml(ep.exampleCall)}</code>
        </button>
      </div>
      <div class="ep-response" id="resp-${id}" hidden>
        <div class="resp-head">
          <span class="resp-label">${escapeHtml(t.endpoints.responseLabel)}</span>
          <button class="copy-btn" data-copy-target="code-${id}">${escapeHtml(t.endpoints.copyBtn)}</button>
        </div>
        <pre class="resp-code"><code id="code-${id}"></code></pre>
      </div>
    </article>`;
}

/**
 * Agrupa as versões por idioma e ordena com o idioma da página primeiro.
 * Idiomas restantes são ordenados pela quantidade de versões (mais → menos).
 */
function groupVersionsByLanguage(
  versions: readonly VersionDefinition[],
  pageLocale: Locale,
): Array<{ language: string; items: VersionDefinition[] }> {
  const groups = new Map<string, VersionDefinition[]>();
  for (const v of versions) {
    if (!groups.has(v.language)) groups.set(v.language, []);
    groups.get(v.language)!.push(v);
  }
  // Ordena versões dentro de cada grupo pelo shortName
  for (const items of groups.values()) {
    items.sort((a, b) => a.shortName.localeCompare(b.shortName));
  }

  // Mapeia o locale da página para o language code dos dados
  const pageLang = pageLocale === 'pt-br' ? 'pt-br' : pageLocale === 'es' ? 'es' : 'en';

  const sorted = Array.from(groups.entries()).sort(([a, ai], [b, bi]) => {
    if (a === pageLang) return -1;
    if (b === pageLang) return 1;
    if (a === 'en' && b !== pageLang) return -1;
    if (b === 'en' && a !== pageLang) return 1;
    // Restantes: mais versões primeiro, depois por código
    if (bi.length !== ai.length) return bi.length - ai.length;
    return a.localeCompare(b);
  });

  return sorted.map(([language, items]) => ({ language, items }));
}

function renderVersionsSection(
  t: Translations,
  locale: Locale,
  versions: readonly VersionDefinition[],
): string {
  const groups = groupVersionsByLanguage(versions, locale);
  const langNames = t.versions.languageNames;

  // Tabs (uma por idioma) — a primeira fica ativa por padrão (idioma da página)
  const tabs = groups
    .map((g, idx) => {
      const langLabel = langNames[g.language] ?? g.language;
      return `
        <button
          type="button"
          class="lang-tab${idx === 0 ? ' is-active' : ''}"
          role="tab"
          aria-selected="${idx === 0 ? 'true' : 'false'}"
          aria-controls="lang-panel-${escapeHtml(g.language)}"
          data-tab="${escapeHtml(g.language)}"
        >
          <span class="lang-tab-code">${escapeHtml(g.language.toUpperCase())}</span>
          <span class="lang-tab-name">${escapeHtml(langLabel)}</span>
          <span class="lang-tab-count">${g.items.length}</span>
        </button>`;
    })
    .join('');

  // Painéis com os cards de versões — só o primeiro fica visível
  const panels = groups
    .map((g, idx) => {
      const cards = g.items
        .map((v) => {
          const scope = v.hasOldTestament && v.hasNewTestament
            ? 'OT + NT'
            : v.hasOldTestament
              ? 'OT only'
              : 'NT only';
          return `
          <a class="version-card" href="https://api.midvash.com/v1/versions/${escapeHtml(v.slug)}" target="_blank" rel="noopener">
            <span class="version-badge">${escapeHtml(v.shortName)}</span>
            <div class="version-info">
              <strong>${escapeHtml(v.name)}</strong>
              <div class="version-meta">
                <code>${escapeHtml(v.slug)}</code>
                <span class="version-scope">${escapeHtml(scope)}</span>
              </div>
            </div>
          </a>`;
        })
        .join('');

      return `
        <div
          class="lang-panel${idx === 0 ? ' is-active' : ''}"
          role="tabpanel"
          id="lang-panel-${escapeHtml(g.language)}"
          data-panel="${escapeHtml(g.language)}"
          ${idx === 0 ? '' : 'hidden'}
        >
          <div class="version-grid">${cards}</div>
        </div>`;
    })
    .join('');

  return `
    <section id="versions" class="versions-section">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(t.versions.title)}</h2>
          <p>${escapeHtml(t.versions.subtitle)}</p>
        </div>
        <div class="lang-tabs-wrapper">
          <div class="lang-tabs" role="tablist">
            ${tabs}
          </div>
          <div class="lang-panels">
            ${panels}
          </div>
        </div>
      </div>
    </section>`;
}

/**
 * HTML da landing memoizado por locale (lazy).
 *
 * Antes os 9 locales eram pré-renderizados no carregamento do módulo, porque o
 * catálogo de versões era constante de build-time. Agora o catálogo vem do R2
 * (async), então renderizamos no primeiro request de cada locale e memoizamos
 * por isolate — o Cache API do edge absorve a maioria das requests e cada cold
 * miss por isolate roda o render uma vez. `versions` deve vir do mesmo catálogo
 * (`getVersionCatalog`) que alimenta os endpoints JSON.
 */
const landingCache = new Map<Locale, string>();

export function getLandingHtml(locale: Locale, versions: readonly VersionDefinition[]): string {
  const cached = landingCache.get(locale);
  if (cached) return cached;
  const html = renderLandingPage(locale, versions);
  // Só memoiza quando há versões — catálogo vazio é degradação transitória do R2.
  if (versions.length > 0) landingCache.set(locale, html);
  return html;
}

export function renderLandingPage(locale: Locale, versions: readonly VersionDefinition[]): string {
  const t = TRANSLATIONS[locale];

  const alternates = SUPPORTED_LOCALES.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${pathForLocale(l)}">`,
  ).join('\n');

  const langSwitcherHtml = langSwitcherMarkup(locale, SELECT_LANGUAGE_LABEL[locale]);

  const featureCards = t.features.cards
    .map(
      (card) => `
      <article class="feature-card">
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.body)}</p>
      </article>`,
    )
    .join('');

  const sidebarGroups = t.endpoints.groups
    .map(
      (g) => `
      <div class="sidebar-group">
        <div class="sidebar-group-label">${escapeHtml(g.group)}</div>
        <ul>
          ${g.items
            .map(
              (ep) =>
                `<li><a href="#ep-${endpointId(ep)}"><span class="sb-method">${ep.method}</span><span class="sb-path">${escapeHtml(ep.path)}</span></a></li>`,
            )
            .join('')}
        </ul>
      </div>`,
    )
    .join('');

  const endpointGroups = t.endpoints.groups
    .map(
      (g) => `
      <section class="ep-group">
        <h2 class="ep-group-title">${escapeHtml(g.group)}</h2>
        ${g.items.map((ep) => renderEndpointCard(ep, t)).join('')}
      </section>`,
    )
    .join('');

  const uiStrings = JSON.stringify({
    runningBtn: t.endpoints.runningBtn,
    runBtn: t.endpoints.runBtn,
    errorLabel: t.endpoints.errorLabel,
    copyBtn: t.endpoints.copyBtn,
    copiedBtn: t.endpoints.copiedBtn,
  });

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(t.meta.title)}</title>
<meta name="description" content="${escapeHtml(t.meta.description)}">
<meta property="og:title" content="${escapeHtml(t.meta.title)}">
<meta property="og:description" content="${escapeHtml(t.meta.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}${pathForLocale(locale)}">
<meta property="og:site_name" content="Midvash">
<meta property="og:locale" content="${OG_LOCALES[locale]}">
<meta property="og:image" content="https://midvash.com/brand/og-api.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="600">
<meta property="og:image:alt" content="${escapeHtml(t.meta.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(t.meta.title)}">
<meta name="twitter:description" content="${escapeHtml(t.meta.description)}">
<meta name="twitter:image" content="https://midvash.com/brand/og-api.jpg">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
<meta name="theme-color" content="#B17027">
<link rel="icon" href="https://midvash.com/brand/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="https://midvash.com/brand/icon.svg">
<link rel="apple-touch-icon" href="https://midvash.com/brand/apple-touch-icon.png">
<link rel="canonical" href="${SITE_URL}${pathForLocale(locale)}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Gloock&family=JetBrains+Mono:wght@400;500;600&family=Literata:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<style>
:root {
  --primary: #B17027;
  --primary-hover: #985F1F;
  --primary-soft: #FBF5E8;
  --text: #30281D;
  --text-soft: #5C5343;
  --text-muted: #827B6E;
  --bg: #FBF5E8;
  --bg-soft: #F5EFE2;
  --bg-card: #FFFDF7;
  --bg-code: #27221B;
  --code-text: #EDE4D3;
  --border: #E6DFD0;
  --border-strong: #CFC4AC;
  --accent: #E8B45A;
  --success: #5C7A3F;
  --method-get: #5C7A3F;
  --shadow-sm: 0 1px 2px rgba(48, 40, 29, 0.04);
  --shadow-md: 0 4px 16px rgba(177, 112, 39, 0.10);
  --shadow-lg: 0 12px 32px rgba(177, 112, 39, 0.16);
  --radius: 12px;
  --radius-lg: 16px;
  --font-sans: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: 'Literata', 'Iowan Old Style', Georgia, serif;
  --font-display: 'Gloock', 'Literata', Georgia, serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --primary: #ECC779;
    --primary-hover: #F0CE8A;
    --primary-soft: #302A21;
    --text: #EDE4D3;
    --text-soft: #C7BCA5;
    --text-muted: #B4A994;
    --bg: #27221B;
    --bg-soft: #302A21;
    --bg-card: #302A21;
    --bg-code: #1A1611;
    --code-text: #EDE4D3;
    --border: #4A4235;
    --border-strong: #5C5343;
    --accent: #E8B45A;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.30);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.35);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.45);
  }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; scroll-padding-top: 88px; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.skip-link {
  position: absolute; left: -9999px; top: 0;
  background: var(--primary); color: #fff; padding: 12px 18px; z-index: 100;
}
.skip-link:focus { left: 16px; top: 16px; }

/* HEADER */
.site-header {
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: sticky; top: 0; z-index: 50;
}
.header-inner {
  display: flex; align-items: center; justify-content: space-between; height: 72px;
}
.brand {
  display: flex; align-items: center; gap: 12px;
  text-decoration: none; color: var(--text);
}
.brand-mark {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.brand-mark svg { width: 100%; height: 100%; display: block; }
.brand-name {
  font-family: var(--font-serif); font-weight: 700; font-size: 20px;
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--text); line-height: 1;
}
.lang-switcher { position: relative; }
.lang-trigger {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 10px 6px 12px; height: 36px;
  background: var(--bg-soft); border: 1px solid var(--border);
  border-radius: 999px; color: var(--text);
  font: inherit; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s ease;
}
.lang-trigger:hover { border-color: var(--primary); }
.lang-trigger[aria-expanded="true"] { border-color: var(--primary); }
.lang-trigger-icon { display: inline-flex; }
.lang-trigger-icon svg { width: 18px; height: 18px; color: var(--primary); }
.lang-trigger-caret { display: inline-flex; transition: transform 0.15s ease; }
.lang-trigger-caret svg { width: 14px; height: 14px; color: var(--text-muted); }
.lang-trigger[aria-expanded="true"] .lang-trigger-caret { transform: rotate(180deg); }
.lang-trigger-label { line-height: 1; }
@media (max-width: 480px) {
  .lang-trigger-label { display: none; }
  .lang-trigger { padding: 6px; }
}
.lang-menu {
  position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 200px; max-height: 70vh; overflow-y: auto;
  margin: 0; padding: 6px;
  background: var(--bg, #fff); color: var(--text);
  border: 1px solid var(--border); border-radius: 12px;
  list-style: none;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
  z-index: 60;
}
.lang-menu li { margin: 0; }
.lang-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px;
  text-decoration: none; color: var(--text-muted);
  font-size: 14px; font-weight: 500;
}
.lang-item:hover { background: var(--bg-soft); color: var(--text); }
.lang-item.is-active { background: var(--bg-soft); color: var(--text); font-weight: 700; }
.lang-flag {
  width: 20px; height: 20px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}
.lang-name { line-height: 1.2; }

/* HERO */
.hero {
  padding: 80px 0 56px; text-align: center;
  position: relative; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(177, 112, 39, 0.10), transparent 60%),
    linear-gradient(180deg, var(--bg-soft) 0%, transparent 100%);
  pointer-events: none;
}
.hero-inner { position: relative; z-index: 1; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--primary-soft); color: var(--primary);
  padding: 8px 16px; border-radius: 999px;
  font-size: 13px; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 24px;
}
.eyebrow::before {
  content: ''; width: 6px; height: 6px; border-radius: 999px; background: var(--primary);
}
.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 400; letter-spacing: -0.015em;
  line-height: 1.08; color: var(--text); margin-bottom: 20px;
}
.hero h1 .accent { color: var(--primary); font-style: italic; }
.hero p.hero-sub {
  font-size: clamp(1.05rem, 1.6vw, 1.18rem);
  color: var(--text-soft); max-width: 680px;
  margin: 0 auto 32px; line-height: 1.6;
}
.hero-cta { display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 26px; border-radius: var(--radius);
  font-weight: 600; font-size: 0.975rem;
  text-decoration: none; cursor: pointer; border: none;
  transition: all 0.18s ease; font-family: inherit;
}
.btn-primary {
  background: var(--primary); color: #fff; box-shadow: var(--shadow-md);
}
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: var(--shadow-lg); }
.btn-secondary {
  background: var(--bg); color: var(--primary);
  border: 1px solid var(--border-strong);
}
.btn-secondary:hover { border-color: var(--primary); }

/* QUICK START */
.quick {
  padding: 56px 0; background: var(--bg-soft);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.quick-inner { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: center; max-width: 920px; margin: 0 auto; }
@media (min-width: 880px) { .quick-inner { grid-template-columns: 1fr 1.2fr; gap: 36px; } }
.quick h2 {
  font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400; color: var(--text); margin-bottom: 8px;
}
.quick p { color: var(--text-soft); margin-bottom: 16px; }
.quick .code-block {
  background: var(--bg-code); color: var(--code-text);
  padding: 24px; border-radius: var(--radius);
  font-family: var(--font-mono); font-size: 0.85rem;
  line-height: 1.6; overflow-x: auto;
  position: relative; box-shadow: var(--shadow-md);
}
.quick .code-block .keyword { color: #93c5fd; }
.quick .code-block .string { color: #fbbf24; }

/* FEATURES */
.features-section { padding: 80px 0; }
.section-head { text-align: center; margin-bottom: 48px; }
.section-head h2 {
  font-family: var(--font-display);
  font-size: clamp(1.875rem, 3.5vw, 2.5rem);
  font-weight: 400; letter-spacing: -0.01em; margin-bottom: 12px;
}
.section-head p { font-size: 1.05rem; color: var(--text-soft); max-width: 600px; margin: 0 auto; }
.features-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}
.feature-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 28px;
  box-shadow: var(--shadow-sm); transition: all 0.2s ease;
}
.feature-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.feature-card h3 {
  font-family: var(--font-serif); font-size: 1.25rem;
  font-weight: 600; color: var(--text); margin-bottom: 8px;
}
.feature-card p { font-size: 0.95rem; color: var(--text-soft); line-height: 1.55; }

/* VERSIONS LIST (com tabs por idioma) */
.versions-section {
  padding: 80px 0;
  background: var(--bg-soft);
  border-top: 1px solid var(--border);
}
.lang-tabs-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.lang-tabs {
  display: flex; flex-wrap: wrap;
  gap: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-soft);
  padding: 8px 8px 0;
}
.lang-tab {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--text-soft);
  border: none; cursor: pointer;
  font-family: inherit; font-size: 0.875rem; font-weight: 500;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.lang-tab:hover {
  color: var(--primary);
  background: var(--primary-soft);
}
.lang-tab.is-active {
  background: var(--bg-card);
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}
.lang-tab-code {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 30px; height: 22px; padding: 0 6px;
  background: var(--primary); color: #fff;
  border-radius: 4px;
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.04em;
}
.lang-tab.is-active .lang-tab-code { background: var(--primary); }
.lang-tab-name { font-size: 0.875rem; }
.lang-tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 20px; padding: 0 6px;
  background: var(--bg); color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.7rem; font-weight: 600;
}
.lang-tab.is-active .lang-tab-count {
  background: var(--primary-soft); color: var(--primary);
  border-color: var(--primary-soft);
}
.lang-panels { padding: 28px; }
.lang-panel { display: none; }
.lang-panel.is-active { display: block; animation: fadeInPanel 0.18s ease; }
@keyframes fadeInPanel { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.version-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}
.version-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.version-card:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
.version-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 48px; height: 32px; padding: 0 8px;
  background: var(--primary); color: #fff;
  border-radius: 6px;
  font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.version-info {
  display: flex; flex-direction: column; gap: 2px;
  min-width: 0; flex: 1;
}
.version-info strong {
  font-size: 0.85rem; font-weight: 600; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.version-meta { display: flex; align-items: center; gap: 8px; }
.version-info code {
  font-family: var(--font-mono); font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--bg-soft);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
}
.version-scope {
  font-size: 0.65rem; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  font-weight: 600;
}

/* ENDPOINTS */
.endpoints-section { padding: 80px 0; background: var(--bg-soft); border-top: 1px solid var(--border); }
.endpoints-layout {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 980px) { .endpoints-layout { grid-template-columns: 240px 1fr; gap: 48px; align-items: start; } }
.sidebar {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px;
  position: sticky; top: 88px; max-height: calc(100vh - 120px); overflow-y: auto;
}
.sidebar-group { margin-bottom: 20px; }
.sidebar-group:last-child { margin-bottom: 0; }
.sidebar-group-label {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); font-weight: 700; margin-bottom: 8px;
}
.sidebar ul { list-style: none; }
.sidebar a {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  border-radius: 6px; text-decoration: none; color: var(--text-soft);
  font-size: 0.8rem; line-height: 1.4; transition: all 0.12s ease;
}
.sidebar a:hover { background: var(--primary-soft); color: var(--primary); }
.sb-method {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: var(--method-get); flex-shrink: 0;
}
.sb-path {
  font-family: var(--font-mono); font-size: 0.72rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.ep-group { margin-bottom: 48px; }
.ep-group:last-child { margin-bottom: 0; }
.ep-group-title {
  font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600;
  color: var(--text); margin-bottom: 20px; padding-bottom: 12px;
  border-bottom: 2px solid var(--primary);
  display: inline-block;
}
.endpoint {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 28px;
  margin-bottom: 16px; box-shadow: var(--shadow-sm);
  scroll-margin-top: 88px;
}
.endpoint:hover { box-shadow: var(--shadow-md); }
.ep-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.ep-method {
  background: var(--method-get); color: #fff;
  padding: 4px 10px; border-radius: 6px;
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
}
.ep-path {
  font-family: var(--font-mono); font-size: 0.95rem; font-weight: 500;
  color: var(--text); background: var(--bg-soft);
  padding: 4px 10px; border-radius: 6px;
  border: 1px solid var(--border);
}
.ep-desc { color: var(--text-soft); font-size: 0.95rem; margin-bottom: 16px; }
.ep-params { margin-bottom: 20px; }
.ep-params-label {
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); font-weight: 700; margin-bottom: 8px;
}
.ep-params table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.ep-params td {
  padding: 8px 12px 8px 0; border-bottom: 1px solid var(--border);
  vertical-align: top;
}
.ep-params tr:last-child td { border-bottom: none; }
.param-name { font-family: var(--font-mono); font-weight: 600; color: var(--text); font-size: 0.85rem; }
.param-type { color: var(--text-muted); font-size: 0.75rem; text-transform: lowercase; }
.param-flag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  background: var(--bg-soft); color: var(--text-muted); border: 1px solid var(--border);
}
.param-flag.is-required { background: rgba(217, 119, 6, 0.1); color: var(--accent); border-color: rgba(217, 119, 6, 0.3); }

.ep-tryit { margin-top: 16px; }
.run-btn {
  display: inline-flex; align-items: center; gap: 12px;
  background: var(--primary); color: #fff;
  padding: 12px 18px; border-radius: var(--radius);
  border: none; cursor: pointer; font-family: inherit;
  font-weight: 600; font-size: 0.875rem;
  transition: all 0.15s ease;
  max-width: 100%;
}
.run-btn:hover { background: var(--primary-hover); transform: translateY(-1px); }
.run-btn:disabled { opacity: 0.6; cursor: wait; transform: none; }
.run-icon { font-size: 0.7rem; }
.run-call {
  font-family: var(--font-mono); font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.15); padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 320px;
}

.ep-response {
  margin-top: 18px; border-radius: var(--radius); overflow: hidden;
  border: 1px solid var(--border);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.resp-head {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-soft); padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}
.resp-label {
  font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;
  font-weight: 700; color: var(--text-muted);
}
.copy-btn {
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text-soft); padding: 4px 10px; border-radius: 6px;
  font-family: inherit; font-size: 0.7rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.copy-btn:hover { color: var(--primary); border-color: var(--primary); }
.copy-btn.copied { color: var(--success); border-color: var(--success); }
.resp-code {
  background: var(--bg-code); color: var(--code-text);
  padding: 18px; overflow-x: auto; font-family: var(--font-mono);
  font-size: 0.78rem; line-height: 1.55; max-height: 480px;
}
.resp-code .json-key { color: #93c5fd; }
.resp-code .json-string { color: #fbbf24; }
.resp-code .json-number { color: #f87171; }
.resp-code .json-bool { color: #c4b5fd; }
.resp-code .json-null { color: #94a3b8; }

/* FOOTER */
footer {
  padding: 56px 0; border-top: 1px solid var(--border);
  background: var(--bg-soft); text-align: center;
}
footer p { color: var(--text-muted); font-size: 0.875rem; line-height: 1.6; }
footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
footer a:hover { text-decoration: underline; }
.footer-tagline { margin-top: 6px; font-size: 0.8125rem; }
.footer-links { display: inline-flex; gap: 18px; margin-top: 12px; }

.footer-ecosystem { margin: 0 auto 32px; max-width: 720px; }
.footer-ecosystem-label {
  font-family: var(--font-sans); font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: var(--text-muted); margin-bottom: 16px;
}
.footer-ecosystem-list {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.footer-ecosystem-link {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 12px; border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-soft) !important;
  font-weight: 500 !important; font-size: 0.8125rem;
  text-decoration: none !important; transition: all 0.15s ease;
}
.footer-ecosystem-link:hover {
  border-color: var(--primary); color: var(--primary) !important;
  text-decoration: none !important; transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
.footer-ecosystem-link.is-current {
  border-color: var(--primary); background: var(--primary-soft);
  color: var(--primary) !important; font-weight: 600 !important;
}
.footer-ecosystem-icon { width: 24px; height: 24px; display: inline-flex; }
.footer-ecosystem-icon svg { width: 100%; height: 100%; }
.footer-ecosystem-text { line-height: 1.2; }

.footer-social { margin-bottom: 16px; display: flex; justify-content: center; gap: 18px; }
.footer-social-icon {
  display: inline-flex; width: 22px; height: 22px;
  color: var(--text-muted) !important; text-decoration: none !important;
  transition: color 0.15s ease;
}
.footer-social-icon:hover { color: var(--primary) !important; text-decoration: none !important; }
.footer-social-icon svg { width: 100%; height: 100%; }

.footer-copyright { font-size: 0.75rem; opacity: 0.8; }
.footer-credit { margin-top: 4px; font-size: 0.75rem; opacity: 0.8; }
.footer-credit a { font-weight: 600; }

@media (max-width: 640px) {
  .footer-ecosystem-list { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .hero { padding: 56px 0 40px; }
  .features-section, .endpoints-section, .versions-section { padding: 56px 0; }
  .endpoint { padding: 20px; }
  .ep-path { font-size: 0.8rem; max-width: 100%; overflow-x: auto; }
  .header-inner { height: 64px; }
  .brand-name { font-size: 17px; }
  .run-call { display: none; }
  .lang-panels { padding: 20px; }
  .version-grid { grid-template-columns: 1fr; }
  .lang-tab { padding: 10px 12px; font-size: 0.8rem; }
  .lang-tab-name { display: none; }
}
</style>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebAPI',
  name: 'Midvash Bible API',
  alternateName: ALTERNATE_NAMES[locale] ?? 'Midvash Bible API',
  description: t.meta.description,
  url: `${SITE_URL}${pathForLocale(locale)}`,
  documentation: SITE_URL,
  termsOfService: 'https://midvash.com/terms',
  inLanguage: SUPPORTED_LOCALES as readonly string[],
  isAccessibleForFree: true,
  provider: {
    '@type': 'Organization',
    name: 'Midvash',
    url: 'https://midvash.com',
    logo: 'https://midvash.com/brand/icon.svg',
  },
})}
</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Midvash', item: 'https://midvash.com' + (locale === 'en' ? '' : '/' + locale) },
    {
      '@type': 'ListItem',
      position: 2,
      name: locale === 'pt-br' ? 'API da Bíblia' : locale === 'es' ? 'API de la Biblia' : 'Bible API',
      item: `${SITE_URL}${pathForLocale(locale)}`,
    },
  ],
})}
</script>
</head>
<body>
<a href="#endpoints" class="skip-link">${escapeHtml(t.nav.skipToContent)}</a>

<header class="site-header">
  <div class="container header-inner">
    <a href="${pathForLocale(locale)}" class="brand" aria-label="Midvash API">
      <span class="brand-mark">${midvashLogo()}</span>
      <span class="brand-name">API</span>
    </a>
    ${langSwitcherHtml}
  </div>
</header>

<main>

<section class="hero">
  <div class="container hero-inner">
    <span class="eyebrow">${escapeHtml(t.hero.eyebrow)}</span>
    <h1>${escapeHtml(t.hero.title)} <span class="accent">${escapeHtml(t.hero.titleAccent)}</span></h1>
    <p class="hero-sub">${escapeHtml(t.hero.subtitle)}</p>
    <div class="hero-cta">
      <a href="#endpoints" class="btn btn-primary">${escapeHtml(t.hero.ctaPrimary)} →</a>
      <a href="#quick" class="btn btn-secondary">${escapeHtml(t.hero.ctaSecondary)}</a>
    </div>
  </div>
</section>

<section id="quick" class="quick">
  <div class="container">
    <div class="quick-inner">
      <div>
        <h2>${escapeHtml(t.quickStart.title)}</h2>
        <p>${escapeHtml(t.quickStart.subtitle)}</p>
        <button class="btn btn-primary run-btn" data-call="/v1/nvi/john/3/16" data-target="resp-quickstart">
          <span class="run-icon">▶</span>
          <span class="run-label">${escapeHtml(t.quickStart.runIt)}</span>
        </button>
      </div>
      <div>
        <pre class="code-block"><span class="keyword">fetch</span>(<span class="string">'https://api.midvash.com/v1/nvi/john/3/16'</span>)
  .then(r =&gt; r.<span class="keyword">json</span>())
  .then(data =&gt; <span class="keyword">console</span>.log(data.text))</pre>
      </div>
    </div>
    <div class="container" style="max-width: 920px; margin-top: 24px;">
      <div class="ep-response" id="resp-quickstart" hidden>
        <div class="resp-head">
          <span class="resp-label">${escapeHtml(t.endpoints.responseLabel)}</span>
          <button class="copy-btn" data-copy-target="code-quickstart">${escapeHtml(t.endpoints.copyBtn)}</button>
        </div>
        <pre class="resp-code"><code id="code-quickstart"></code></pre>
      </div>
    </div>
  </div>
</section>

<section class="features-section">
  <div class="container">
    <div class="section-head">
      <h2>${escapeHtml(t.features.title)}</h2>
    </div>
    <div class="features-grid">
      ${featureCards}
    </div>
  </div>
</section>

${renderVersionsSection(t, locale, versions)}

<section id="endpoints" class="endpoints-section">
  <div class="container">
    <div class="section-head">
      <h2>${escapeHtml(t.endpoints.title)}</h2>
      <p>${escapeHtml(t.endpoints.subtitle)}</p>
    </div>
    <div class="endpoints-layout">
      <aside class="sidebar">
        ${sidebarGroups}
      </aside>
      <div class="ep-content">
        ${endpointGroups}
      </div>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="container">
    <nav class="footer-ecosystem" aria-label="${escapeHtml(t.footer.ecosystemLabel)}">
      <h2 class="footer-ecosystem-label">${escapeHtml(t.footer.ecosystemLabel)}</h2>
      <ul class="footer-ecosystem-list">
        ${t.footer.ecosystem
          .map(
            (l) => `
        <li>
          <a href="${escapeHtml(l.href)}" class="footer-ecosystem-link${l.current ? ' is-current' : ''}"${l.current ? ' aria-current="page"' : ''}>
            <span class="footer-ecosystem-icon" aria-hidden="true">${ECOSYSTEM_ICONS[l.iconKey]}</span>
            <span class="footer-ecosystem-text">${escapeHtml(l.label)}</span>
          </a>
        </li>`,
          )
          .join('')}
      </ul>
    </nav>
    <div class="footer-social" aria-label="${escapeHtml(t.footer.socialLabel)}">
      <a href="https://instagram.com/midvash" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.footer.instagramLabel)}" class="footer-social-icon">${INSTAGRAM_ICON}</a>
    </div>
    <p class="footer-copyright">${escapeHtml(t.footer.copyright)}</p>
  </div>
</footer>

<script>
const UI = ${uiStrings};
const API_BASE = 'https://api.midvash.com';

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function highlightJson(json) {
  const escaped = escapeHtml(json);
  return escaped.replace(
    /("([^"\\\\]|\\\\.)*")(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(\\.\\d+)?/g,
    function (match, str, _esc, colon, bool) {
      if (str) {
        return colon
          ? '<span class="json-key">' + str + '</span>' + colon
          : '<span class="json-string">' + str + '</span>';
      }
      if (bool === 'null') return '<span class="json-null">' + match + '</span>';
      if (bool) return '<span class="json-bool">' + match + '</span>';
      return '<span class="json-number">' + match + '</span>';
    }
  );
}

async function runEndpoint(btn) {
  const call = btn.dataset.call;
  const targetId = btn.dataset.target;
  const target = document.getElementById(targetId);
  if (!target) return;
  const codeEl = target.querySelector('code');

  const originalLabel = btn.querySelector('.run-label').textContent;
  btn.disabled = true;
  btn.querySelector('.run-label').textContent = UI.runningBtn;

  try {
    const response = await fetch(API_BASE + call, { headers: { 'Accept': 'application/json' } });
    const text = await response.text();
    let pretty;
    try {
      pretty = JSON.stringify(JSON.parse(text), null, 2);
    } catch (e) {
      pretty = text;
    }
    codeEl.innerHTML = highlightJson(pretty);
    target.removeAttribute('hidden');
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    codeEl.textContent = UI.errorLabel + ': ' + (err && err.message ? err.message : String(err));
    target.removeAttribute('hidden');
  } finally {
    btn.disabled = false;
    btn.querySelector('.run-label').textContent = originalLabel;
  }
}

document.querySelectorAll('.run-btn').forEach(function (btn) {
  btn.addEventListener('click', function () { runEndpoint(btn); });
});

document.querySelectorAll('.copy-btn').forEach(function (btn) {
  btn.addEventListener('click', async function () {
    const targetId = btn.dataset.copyTarget;
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.textContent);
      const originalText = btn.textContent;
      btn.textContent = UI.copiedBtn;
      btn.classList.add('copied');
      setTimeout(function () { btn.textContent = originalText; btn.classList.remove('copied'); }, 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  });
});

// Tabs de idiomas na seção de versões
document.querySelectorAll('.lang-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    const target = tab.dataset.tab;
    if (!target) return;
    document.querySelectorAll('.lang-tab').forEach(function (t) {
      const isActive = t.dataset.tab === target;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('.lang-panel').forEach(function (p) {
      const isActive = p.dataset.panel === target;
      p.classList.toggle('is-active', isActive);
      if (isActive) p.removeAttribute('hidden');
      else p.setAttribute('hidden', '');
    });
  });
});
</script>
<script>${LANG_SWITCHER_SCRIPT}</script>
</body>
</html>`;
}

// (O catálogo agora vem do R2 em runtime, então a landing é renderizada lazy
// por locale em `getLandingHtml` — não há mais pré-render no module scope.)
