import type { VersionDefinition } from '../versions';
import {
  TRANSLATIONS,
  SUPPORTED_LOCALES,
  pathForLocale,
  type Locale,
  type Translations,
  type EndpointDoc,
} from './i18n';
import { DOCS_STRINGS, type DocsStrings } from './docs';
import { BOOKS } from '../books';

const SITE_URL = 'https://api.midvash.com';
const REPO_URL = 'https://github.com/midvash/bible-api';

const ALTERNATE_NAMES: Partial<Record<Locale, string>> = {
  en: 'Bible API by Midvash',
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
const ECOSYSTEM_ICONS: Record<
  'reader' | 'api' | 'mcp' | 'wordpress' | 'chrome' | 'ios' | 'android',
  string
> = {
  reader:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></svg>',
  api:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M251.31,180.69l-30-30a16,16,0,0,0-22.63,0L194,155.32V123.31a47.81,47.81,0,0,0-14.06-34l-43.87-43.87L141,40.49a16,16,0,0,0,0-22.63L131.31,8.18a16,16,0,0,0-22.62,0L74.34,42.52a16,16,0,0,0,0,22.63L84,74.83,40.13,118.69a47.81,47.81,0,0,0,0,67.88l29.3,29.3a47.81,47.81,0,0,0,67.88,0L181.17,172l9.69,9.69a16,16,0,0,0,22.62,0l34.34-34.35A16,16,0,0,0,251.31,180.69ZM120,40H136v16H120Zm-32,32H120V88H88ZM68,116l24-24,52,52-24,24Zm120,52L132.69,112.69a16,16,0,0,0-22.62,0L72.69,150.06a16,16,0,0,0,0,22.63L92,192H40V40H88Z"/></svg>',
  mcp:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M200,48H136V16a8,8,0,0,0-16,0V48H56A32,32,0,0,0,24,80V192a32,32,0,0,0,32,32H200a32,32,0,0,0,32-32V80A32,32,0,0,0,200,48Zm16,144a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V80A16,16,0,0,1,56,64H200a16,16,0,0,1,16,16ZM104,128a12,12,0,1,1-12-12A12,12,0,0,1,104,128Zm72,0a12,12,0,1,1-12-12A12,12,0,0,1,176,128Z"/></svg>',
  wordpress:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24ZM43,98.65l32.05,87.78A88.16,88.16,0,0,1,43,98.65Zm87.59,89.34L102.34,109.78l27.07,1.21,21.6,59.4ZM89.62,97.32a44.86,44.86,0,0,1-7.62-1.36c12.18-1.62,24.07-2.64,32.93-3a51.12,51.12,0,0,1,9.43,2.07c.93,3.06,1.49,5.55,1.74,8.21Zm105.81-19a55.43,55.43,0,0,0-3.5,8.36c-1.4,4-3.27,9.43-3.27,16.83,0,3.7,1.42,9.7,4.66,17.7,7.66,18.93,12.91,32.05,12.91,52.79a86.86,86.86,0,0,1-3.27,23.92L181.42,127c8-12.13,12.6-23.45,12.6-32.41a64.55,64.55,0,0,0-1.91-15.27Zm-25.59,21.78c0,2.43.65,5,1.42,8.21H115.81L116,98.91c4.93-2.13,16.13-3.06,21.7-3.06a36.39,36.39,0,0,1,9,1.16Zm-65.55-39.4a87.84,87.84,0,0,1,93.07,11.93c-1.6.06-9.79.5-19,4.79-3.27,1.5-9.16,4.81-9.16,12.85,0,3,1.21,5.63,3.06,9.49a26.36,26.36,0,0,1,2.34,5.34A78.31,78.31,0,0,1,128,89.69c-19.81,0-37.6,2.16-39.62,2.41-1.55-3.69-1.66-5.5-1.66-7,0-7.43,5.34-9.84,11.61-12.43,3.74-1.55,8.18-2.66,8.18-2.66l-1.51-7.41,1-2A86.41,86.41,0,0,1,128,40,86.86,86.86,0,0,1,168.59,49.69ZM69.85,80.13c1.13-.16,5.79-3.83,11.78-3.83,9.65,0,17.32,7.16,17.32,16,0,9.13-9.07,15-19.13,17.16C66.79,113.49,57.34,123.05,57,123.36L52.55,107A89,89,0,0,1,69.85,80.13ZM128,216A87.85,87.85,0,0,1,77.34,200l54.94-79.81L153.5,193A88,88,0,0,1,128,216Z"/></svg>',
  chrome:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M220.27,158.54a8,8,0,0,0-7.7-.46,20,20,0,1,1,0-36.16A8,8,0,0,0,224,114.69V72a16,16,0,0,0-16-16H171.78a35.36,35.36,0,0,0,.22-4,36.11,36.11,0,0,0-11.36-26.24,36,36,0,0,0-60.55,23.62,36.56,36.56,0,0,0,.14,6.62H64A16,16,0,0,0,48,72v32.22a35.36,35.36,0,0,0-4-.22,36.12,36.12,0,0,0-26.24,11.36,35.7,35.7,0,0,0-9.69,27,36.08,36.08,0,0,0,33.31,33.6,35.68,35.68,0,0,0,6.62-.14V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V165.31A8,8,0,0,0,220.27,158.54ZM208,208H64V165.31a8,8,0,0,0-11.43-7.23,20,20,0,1,1,0-36.16A8,8,0,0,0,64,114.69V72h46.69a8,8,0,0,0,7.23-11.43,20,20,0,1,1,36.16,0A8,8,0,0,0,161.31,72H208v32.23a35.68,35.68,0,0,0-6.62-.14A36,36,0,0,0,204,176a35.36,35.36,0,0,0,4-.22Z"/></svg>',
  ios:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M223.3,169.59a8.07,8.07,0,0,0-2.8-3.4C203.53,154.53,200,134.64,200,120c0-17.67,13.47-33.06,21.5-40.67a8,8,0,0,0,0-11.62C208.82,55.74,187.82,48,168,48a72.2,72.2,0,0,0-40,12.13,71.56,71.56,0,0,0-90.71,9.09A74.63,74.63,0,0,0,16,123.4a127.06,127.06,0,0,0,40.14,89.73A39.8,39.8,0,0,0,83.59,224h87.68a39.84,39.84,0,0,0,29.12-12.57,125,125,0,0,0,17.82-24.6C225.23,174,224.33,172,223.3,169.59Zm-34.63,30.94a23.76,23.76,0,0,1-17.4,7.47H83.59a23.82,23.82,0,0,1-16.44-6.51A111.14,111.14,0,0,1,32,123,58.5,58.5,0,0,1,48.65,80.47,54.81,54.81,0,0,1,88,64h.78A55.45,55.45,0,0,1,123,76.28a8,8,0,0,0,10,0A55.44,55.44,0,0,1,168,64a70.64,70.64,0,0,1,36,10.35c-13,14.52-20,30.47-20,45.65,0,23.77,7.64,42.73,22.18,55.3A105.82,105.82,0,0,1,188.67,200.53ZM128.23,30A40,40,0,0,1,167,0h1a8,8,0,0,1,0,16h-1a24,24,0,0,0-23.24,18,8,8,0,1,1-15.5-4Z"/></svg>',
  android:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M176,148a12,12,0,1,1-12-12A12,12,0,0,1,176,148ZM92,136a12,12,0,1,0,12,12A12,12,0,0,0,92,136Zm148,24v24a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V161.13A113.38,113.38,0,0,1,51.4,78.72L26.34,53.66A8,8,0,0,1,37.66,42.34L63.82,68.5a111.43,111.43,0,0,1,128.55-.19l26-26a8,8,0,0,1,11.32,11.32L204.82,78.5c.75.71,1.5,1.43,2.24,2.17A111.25,111.25,0,0,1,240,160Zm-16,0a96,96,0,0,0-96-96h-.34C74.91,64.18,32,107.75,32,161.13V184H224Z"/></svg>',
};

// Repositórios open source do Midvash (globais — não localizados). Ordem:
// este projeto primeiro, depois os datasets/SDK e plugins.
const GITHUB_ORG_URL = 'https://github.com/midvash';
const OSS_REPOS: ReadonlyArray<{ name: string; url: string; current?: boolean }> = [
  { name: 'bible-api', url: 'https://github.com/midvash/bible-api', current: true },
  { name: 'bible-data', url: 'https://github.com/midvash/bible-data' },
  { name: 'bible-data-js', url: 'https://github.com/midvash/bible-data-js' },
  { name: 'bible-cross-references', url: 'https://github.com/midvash/bible-cross-references' },
  { name: 'bible-by-midvash', url: 'https://github.com/midvash/bible-by-midvash' },
  { name: 'emdash-plugin-bible', url: 'https://github.com/midvash/emdash-plugin-bible' },
];

const INSTAGRAM_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"/></svg>';

const GITHUB_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68Z"/></svg>';

// JSON de exemplo (constante) das seções de formato/erros — escapados no render.
const SUCCESS_ENVELOPE_JSON = `{
  "data": {
    "version": "kjv",
    "book": "john",
    "chapter": 3,
    "verse": 16,
    "text": "For God so loved the world…",
    "verses": ["For God so loved the world…"]
  },
  "meta": { "reference": "John 3:16", "total": 1 }
}`;

const ERROR_ENVELOPE_JSON = `{
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "Book \\"jhon\\" not found. Did you mean \\"john\\"?",
    "details": { "didYouMean": "john" }
  }
}`;

// code → HTTP status, na ordem em que aparecem na tabela de erros.
const ERROR_ROWS: ReadonlyArray<[keyof DocsStrings['errors']['when'], string]> = [
  ['INVALID_PARAMS', '400'],
  ['NOT_FOUND', '404'],
  ['VERSION_NOT_FOUND', '404'],
  ['BOOK_NOT_FOUND', '404'],
  ['CHAPTER_NOT_FOUND', '404'],
  ['VERSE_NOT_FOUND', '404'],
  ['INTERNAL_ERROR', '500'],
];

// Snippets copia-e-cola (constantes). As legendas vêm do i18n (docs.guides).
const GUIDE_EXAMPLES: ReadonlyArray<{ call: string; curl: string; js: string; py: string }> = [
  {
    call: '/v1/kjv/john/3/16',
    curl: 'curl https://api.midvash.com/v1/kjv/john/3/16',
    js: "const res = await fetch('https://api.midvash.com/v1/kjv/john/3/16');\nconst { data } = await res.json();\nconsole.log(data.text);",
    py: "import requests\nr = requests.get('https://api.midvash.com/v1/kjv/john/3/16')\nprint(r.json()['data']['text'])",
  },
  {
    call: '/v1/versions?language=pt-br',
    curl: "curl 'https://api.midvash.com/v1/versions?language=pt-br'",
    js: "const res = await fetch('https://api.midvash.com/v1/versions?language=pt-br');\nconst { data, meta } = await res.json();\nconsole.log(meta.total, data);",
    py: "import requests\nr = requests.get('https://api.midvash.com/v1/versions', params={'language': 'pt-br'})\nprint(r.json()['meta']['total'])",
  },
  {
    call: '/v1/votd?language=en',
    curl: "curl 'https://api.midvash.com/v1/votd?language=en'",
    js: "const res = await fetch('https://api.midvash.com/v1/votd?language=en');\nconst votd = await res.json(); // flat shape, no envelope\nconsole.log(votd.reference, votd.text);",
    py: "import requests\nv = requests.get('https://api.midvash.com/v1/votd', params={'language': 'en'}).json()\nprint(v['reference'], v['text'])",
  },
];

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
 * Substitui os tokens {versions} e {languages} em qualquer string da árvore de
 * traduções pelos valores reais do catálogo (lidos do R2 em runtime). Isso
 * mantém as contagens da landing sempre em sincronia — adicionar uma versão no
 * R2 atualiza a página sem precisar editar copy nos 9 idiomas.
 */
function fillCounts<T>(value: T, vars: { versions: number; languages: number; year: number }): T {
  if (typeof value === 'string') {
    return value
      .replace(/\{versions\}/g, String(vars.versions))
      .replace(/\{languages\}/g, String(vars.languages))
      .replace(/\{year\}/g, String(vars.year)) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => fillCounts(v, vars)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = fillCounts(v, vars);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * Browser dos 66 livros, agrupado por testamento (espelha o browser de versões).
 * Nomes/slugs/abreviações no idioma da página; cada card linka pro /v1/books/{slug}.
 */
function renderBooksSection(docs: DocsStrings, locale: Locale): string {
  const b = docs.books;

  const renderGroup = (label: string, testament: 'old' | 'new'): string => {
    const items = BOOKS.filter((bk) => bk.testament === testament);
    const cards = items
      .map((bk) => {
        const name = bk.names[locale];
        const slug = bk.slugs[locale];
        return `
          <a class="version-card" href="https://api.midvash.com/v1/books/${encodeURIComponent(slug)}" target="_blank" rel="noopener">
            <span class="version-badge">${escapeHtml(bk.abbrev[locale])}</span>
            <div class="version-info">
              <strong>${escapeHtml(name)}</strong>
              <div class="version-meta">
                <code>${escapeHtml(slug)}</code>
                <span class="version-scope">${bk.chapters} ${escapeHtml(b.chaptersAbbr)}</span>
              </div>
            </div>
          </a>`;
      })
      .join('');
    return `
        <div class="books-group">
          <div class="books-group-title">${escapeHtml(label)} <span class="books-count">${items.length}</span></div>
          <div class="version-grid">${cards}</div>
        </div>`;
  };

  return `
    <section id="books" class="docs-section">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(b.title)}</h2>
          <p>${escapeHtml(b.subtitle)}</p>
        </div>
        ${renderGroup(b.oldTestament, 'old')}
        ${renderGroup(b.newTestament, 'new')}
      </div>
    </section>`;
}

/** Formato de resposta (envelope { data, meta }) + semântica de cache/HTTP. */
function renderFormatSection(docs: DocsStrings): string {
  const f = docs.format;
  const httpRows = f.httpRows
    .map(
      (r) =>
        `<tr><td class="kv-key">${escapeHtml(r.k)}</td><td class="kv-val">${escapeHtml(r.v)}</td></tr>`,
    )
    .join('');

  return `
    <section id="format" class="docs-section">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(f.title)}</h2>
          <p>${escapeHtml(f.subtitle)}</p>
        </div>
        <div class="docs-block">
          <h3 class="docs-sub-title">${escapeHtml(f.envelopeTitle)}</h3>
          <p class="docs-p">${escapeHtml(f.envelopeDesc)}</p>
          <pre class="docs-code"><code>${escapeHtml(SUCCESS_ENVELOPE_JSON)}</code></pre>
        </div>
        <div class="docs-block">
          <h3 class="docs-sub-title">${escapeHtml(f.httpTitle)}</h3>
          <table class="kv-table"><tbody>${httpRows}</tbody></table>
          <div class="callout">
            <span class="callout-mark" aria-hidden="true">!</span>
            <div class="callout-body">
              <strong>${escapeHtml(f.votdNoteTitle)}</strong>
              <p>${escapeHtml(f.votdNote)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

/** Taxonomia de erros: envelope { error } + tabela code / status / quando. */
function renderErrorsSection(docs: DocsStrings): string {
  const e = docs.errors;
  const rows = ERROR_ROWS.map(([code, status]) => {
    const cls = status.startsWith('5') ? 's5' : 's4';
    return `
          <tr>
            <td><code class="err-code">${code}</code></td>
            <td><span class="err-status ${cls}">${status}</span></td>
            <td>${escapeHtml(e.when[code])}</td>
          </tr>`;
  }).join('');

  return `
    <section id="errors" class="docs-section alt">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(e.title)}</h2>
          <p>${escapeHtml(e.subtitle)}</p>
        </div>
        <div class="docs-block">
          <pre class="docs-code"><code>${escapeHtml(ERROR_ENVELOPE_JSON)}</code></pre>
          <table class="err-table">
            <thead><tr><th>${escapeHtml(e.colCode)}</th><th>${escapeHtml(e.colStatus)}</th><th>${escapeHtml(e.colWhen)}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="docs-note">${escapeHtml(e.shapeNote)}</p>
        </div>
      </div>
    </section>`;
}

/** Guias copia-e-cola — mesmo request em cURL / JavaScript / Python (code tabs). */
function renderGuidesSection(docs: DocsStrings): string {
  const g = docs.guides;
  const captions = [g.ex1, g.ex2, g.ex3];
  const guides = GUIDE_EXAMPLES.map((ex, i) => {
    return `
        <article class="guide">
          <h3 class="guide-title">${escapeHtml(captions[i] ?? '')} <code class="guide-call">${escapeHtml(ex.call)}</code></h3>
          <div class="code-tabs" data-code-tabs>
            <div class="code-tabbar" role="tablist">
              <button type="button" class="code-tab is-active" data-codelang="curl">cURL</button>
              <button type="button" class="code-tab" data-codelang="js">JavaScript</button>
              <button type="button" class="code-tab" data-codelang="py">Python</button>
            </div>
            <pre class="code-view is-active" data-codelang="curl"><code>${escapeHtml(ex.curl)}</code></pre>
            <pre class="code-view" data-codelang="js" hidden><code>${escapeHtml(ex.js)}</code></pre>
            <pre class="code-view" data-codelang="py" hidden><code>${escapeHtml(ex.py)}</code></pre>
          </div>
        </article>`;
  }).join('');

  return `
    <section id="guides" class="docs-section">
      <div class="container">
        <div class="section-head">
          <h2>${escapeHtml(g.title)}</h2>
          <p>${escapeHtml(g.subtitle)}</p>
        </div>
        <div class="docs-block">
          ${guides}
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
  // Contagens reais derivadas do catálogo (R2) — interpoladas nos tokens
  // {versions}/{languages} das traduções. Mantém a copy sempre atual.
  const versionCount = versions.length;
  const languageCount = new Set(versions.map((v) => v.language)).size;
  // year is read at request time — Workers freeze Date() during module load,
  // so doing this in the i18n constants would lock the copyright at 1970.
  const year = new Date().getFullYear();
  const t = fillCounts(TRANSLATIONS[locale], {
    versions: versionCount,
    languages: languageCount,
    year,
  });
  const docs = DOCS_STRINGS[locale];

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
.brand-id { display: flex; flex-direction: column; gap: 2px; }
.brand-name {
  font-family: var(--font-serif); font-weight: 700; font-size: 18px;
  letter-spacing: 0.03em; text-transform: uppercase; color: var(--text); line-height: 1;
}
.brand-by {
  font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--text-muted); line-height: 1;
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
  padding: 56px 0 40px; border-top: 1px solid var(--border);
  background: var(--bg-soft); text-align: left;
}
footer p { color: var(--text-muted); font-size: 0.875rem; line-height: 1.6; }
footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
footer a:hover { text-decoration: underline; }
/* Footer multi-coluna (marca + produtos + open source) */
.footer-top { display: grid; grid-template-columns: 1fr; gap: 40px; }
@media (min-width: 768px) {
  .footer-top { grid-template-columns: minmax(190px, 240px) 1fr; gap: 56px; align-items: start; }
}
.footer-brand { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.footer-brand-mark { width: 38px; height: 38px; flex-shrink: 0; }
.footer-brand-mark svg { width: 100%; height: 100%; display: block; }
.footer-brand-id { display: flex; flex-direction: column; gap: 2px; }
.footer-brand-name {
  font-family: var(--font-serif); font-weight: 700; font-size: 18px;
  letter-spacing: 0.03em; text-transform: uppercase; color: var(--text); line-height: 1;
}
.footer-brand-by {
  font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--text-muted); line-height: 1;
}

.footer-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 28px 40px; }
.footer-col-title {
  font-family: var(--font-sans); font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--text-muted); margin-bottom: 12px;
}
.footer-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.footer-link {
  display: inline-flex; align-items: center; gap: 9px; width: 100%;
  padding: 6px 0; color: var(--text-soft) !important; font-weight: 500 !important;
  font-size: 0.875rem; text-decoration: none !important; transition: color 0.14s ease;
}
a.footer-link:hover { color: var(--primary) !important; text-decoration: none !important; }
a.footer-link:hover .footer-link-icon { color: var(--primary); }
.footer-link.is-current { color: var(--primary) !important; font-weight: 600 !important; }
.footer-link.is-current .footer-link-icon { color: var(--primary); }
.footer-link.is-soon { color: var(--text-muted) !important; cursor: default; }
.footer-link-icon { width: 18px; height: 18px; flex-shrink: 0; display: inline-flex; opacity: 0.9; transition: color 0.14s ease; }
.footer-link-icon svg { width: 100%; height: 100%; }
.footer-link-text { line-height: 1.3; }
.footer-repo-name { font-family: var(--font-mono); font-size: 0.82rem; }
.footer-all-repos { color: var(--primary) !important; font-weight: 600 !important; font-size: 0.82rem; }
.soon-badge {
  margin-left: auto; font-size: 0.6rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 7px;
  border-radius: 999px; background: var(--bg-card); color: var(--text-muted);
  border: 1px solid var(--border); white-space: nowrap;
}

.footer-social { display: flex; gap: 16px; width: 100%; margin-top: 4px; }
.footer-social-icon {
  display: inline-flex; width: 22px; height: 22px;
  color: var(--text-muted) !important; text-decoration: none !important;
  transition: color 0.15s ease;
}
.footer-social-icon:hover { color: var(--primary) !important; text-decoration: none !important; }
.footer-social-icon svg { width: 100%; height: 100%; }

.footer-bottom {
  margin-top: 44px; padding-top: 24px; border-top: 1px solid var(--border);
  text-align: center;
}
.footer-tagline { font-size: 0.8125rem; color: var(--text-soft); }
.footer-copyright { margin-top: 6px; font-size: 0.75rem; opacity: 0.85; }
.footer-credit { margin-top: 2px; font-size: 0.75rem; opacity: 0.85; }
.footer-credit a { font-weight: 600; }

@media (max-width: 640px) {
  .footer-cols { gap: 24px 28px; }
}

/* DOCS SECTIONS — format / errors / books / guides */
.docs-section { padding: 80px 0; border-top: 1px solid var(--border); }
.docs-section.alt { background: var(--bg-soft); }
.docs-block { max-width: 920px; margin: 0 auto; }
.docs-block + .docs-block { margin-top: 36px; }
.docs-sub-title {
  font-family: var(--font-serif); font-size: 1.2rem; font-weight: 600;
  color: var(--text); margin-bottom: 10px;
}
.docs-p { color: var(--text-soft); font-size: 0.95rem; margin-bottom: 16px; }
.docs-note { font-size: 0.85rem; color: var(--text-muted); margin-top: 14px; }
.docs-code {
  background: var(--bg-code); color: var(--code-text);
  padding: 20px; border-radius: var(--radius);
  font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6;
  overflow-x: auto; box-shadow: var(--shadow-sm); margin: 0;
}

/* KV / HTTP table */
.kv-table {
  width: 100%; border-collapse: collapse; font-size: 0.9rem;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.kv-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
.kv-table tr:last-child td { border-bottom: none; }
.kv-table .kv-key { white-space: nowrap; font-weight: 700; color: var(--primary); width: 1%; }
.kv-table .kv-val { color: var(--text-soft); }

/* Callout (votd flat-shape note) */
.callout {
  display: flex; gap: 14px; padding: 16px 18px; margin-top: 22px;
  border-radius: var(--radius); background: var(--primary-soft);
  border: 1px solid var(--border-strong);
}
.callout-mark {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  background: var(--primary); color: #fff; font-weight: 700; font-size: 0.85rem;
}
.callout-body strong { display: block; color: var(--text); margin-bottom: 4px; font-family: var(--font-mono); font-size: 0.9rem; }
.callout-body p { color: var(--text-soft); font-size: 0.9rem; }

/* Errors table */
.err-table {
  width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 20px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.err-table th {
  text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); font-weight: 700; padding: 12px 16px;
  background: var(--bg-soft); border-bottom: 1px solid var(--border);
}
.err-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: top; color: var(--text-soft); }
.err-table tr:last-child td { border-bottom: none; }
.err-code { font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--text); }
.err-status {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 34px; padding: 2px 8px; border-radius: 999px;
  font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
}
.err-status.s4 { background: rgba(217, 119, 6, 0.12); color: var(--accent); }
.err-status.s5 { background: rgba(192, 83, 59, 0.14); color: #C0533B; }

/* Books groups (reuse .version-card / .version-grid) */
.books-group { margin-top: 28px; }
.books-group:first-child { margin-top: 0; }
.books-group-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); font-weight: 700; margin-bottom: 16px;
}
.books-group-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.books-count { color: var(--primary); }

/* Code tabs (guides) */
.guide { margin-top: 28px; }
.guide:first-child { margin-top: 0; }
.guide-title {
  font-family: var(--font-serif); font-size: 1.05rem; font-weight: 600;
  color: var(--text); margin-bottom: 10px;
}
.guide-call { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }
.code-tabs { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.code-tabbar { display: flex; gap: 4px; background: var(--bg-soft); border-bottom: 1px solid var(--border); padding: 6px 6px 0; }
.code-tab {
  background: transparent; border: none; cursor: pointer;
  font-family: var(--font-mono); font-size: 0.78rem; font-weight: 600;
  color: var(--text-muted); padding: 8px 14px;
  border-radius: 8px 8px 0 0; border-bottom: 2px solid transparent;
  margin-bottom: -1px; transition: all 0.15s ease;
}
.code-tab:hover { color: var(--primary); }
.code-tab.is-active { background: var(--bg-code); color: var(--code-text); border-bottom-color: var(--primary); }
.code-view {
  margin: 0; background: var(--bg-code); color: var(--code-text);
  padding: 18px; overflow-x: auto;
  font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6;
}
.code-view[hidden] { display: none; }

@media (max-width: 640px) {
  .hero { padding: 56px 0 40px; }
  .features-section, .endpoints-section, .versions-section, .docs-section { padding: 56px 0; }
  .endpoint { padding: 20px; }
  .ep-path { font-size: 0.8rem; max-width: 100%; overflow-x: auto; }
  .header-inner { height: 64px; }
  .brand-name { font-size: 17px; }
  .run-call { display: none; }
  .lang-panels { padding: 20px; }
  .version-grid { grid-template-columns: 1fr; }
  .lang-tab { padding: 10px 12px; font-size: 0.8rem; }
  .lang-tab-name { display: none; }
  .kv-table td, .err-table td, .err-table th { padding: 10px 12px; }
  .docs-code, .code-view { font-size: 0.72rem; }
}
</style>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebAPI',
  name: 'Bible API by Midvash',
  alternateName: ALTERNATE_NAMES[locale] ?? 'Bible API by Midvash',
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
    <a href="${pathForLocale(locale)}" class="brand" aria-label="Bible API by Midvash">
      <span class="brand-mark">${midvashLogo()}</span>
      <span class="brand-id">
        <span class="brand-name">Bible API</span>
        <span class="brand-by">by Midvash</span>
      </span>
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

${renderBooksSection(docs, locale)}

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

${renderFormatSection(docs)}

${renderErrorsSection(docs)}

${renderGuidesSection(docs)}

</main>

<footer>
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="footer-brand-mark">${midvashLogo()}</span>
        <span class="footer-brand-id">
          <span class="footer-brand-name">Bible API</span>
          <span class="footer-brand-by">by Midvash</span>
        </span>
        <div class="footer-social" aria-label="${escapeHtml(t.footer.socialLabel)}">
          <a href="https://instagram.com/midvash" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.footer.instagramLabel)}" class="footer-social-icon">${INSTAGRAM_ICON}</a>
          <a href="${GITHUB_ORG_URL}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" class="footer-social-icon">${GITHUB_ICON}</a>
        </div>
      </div>
      <nav class="footer-cols" aria-label="${escapeHtml(t.footer.ecosystemLabel)}">
        <div class="footer-col">
          <h2 class="footer-col-title">${escapeHtml(t.footer.productsLabel)}</h2>
          <ul>
            ${t.footer.ecosystem
              .map((l) => {
                const icon = `<span class="footer-link-icon" aria-hidden="true">${ECOSYSTEM_ICONS[l.iconKey]}</span>`;
                const text = `<span class="footer-link-text">${escapeHtml(l.label)}</span>`;
                if (l.soon) {
                  return `<li><span class="footer-link is-soon">${icon}${text}<span class="soon-badge">${escapeHtml(t.footer.soonLabel)}</span></span></li>`;
                }
                const cur = l.current ? ' is-current' : '';
                const aria = l.current ? ' aria-current="page"' : '';
                return `<li><a class="footer-link${cur}" href="${escapeHtml(l.href ?? '#')}"${aria}>${icon}${text}</a></li>`;
              })
              .join('')}
          </ul>
        </div>
        <div class="footer-col">
          <h2 class="footer-col-title">${escapeHtml(t.footer.openSourceLabel)}</h2>
          <ul>
            ${OSS_REPOS.map((r) => {
              const cur = r.current ? ' is-current' : '';
              const aria = r.current ? ' aria-current="page"' : '';
              return `<li><a class="footer-link footer-repo${cur}" href="${r.url}" target="_blank" rel="noopener"${aria}><span class="footer-repo-name">${escapeHtml(r.name)}</span></a></li>`;
            }).join('')}
            <li><a class="footer-link footer-all-repos" href="${GITHUB_ORG_URL}" target="_blank" rel="noopener">${escapeHtml(t.footer.allReposLabel)} →</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <div class="footer-bottom">
      <p class="footer-tagline">${escapeHtml(t.footer.tagline)}</p>
      <p class="footer-copyright">${escapeHtml(t.footer.copyright)}</p>
      <p class="footer-credit">${escapeHtml(t.footer.builtBy)} <a href="https://netogregorio.com" target="_blank" rel="noopener">Neto Gregório</a></p>
    </div>
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

// Code tabs (cURL / JavaScript / Python) na seção de guias
document.querySelectorAll('[data-code-tabs]').forEach(function (group) {
  group.querySelectorAll('.code-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      const lang = tab.dataset.codelang;
      group.querySelectorAll('.code-tab').forEach(function (t) {
        t.classList.toggle('is-active', t.dataset.codelang === lang);
      });
      group.querySelectorAll('.code-view').forEach(function (v) {
        const on = v.dataset.codelang === lang;
        v.classList.toggle('is-active', on);
        if (on) v.removeAttribute('hidden');
        else v.setAttribute('hidden', '');
      });
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
