/**
 * Traduções da landing page api.midvash.com para os 9 idiomas suportados.
 * Inglês é canônico em /; demais locales em /pt-br, /es, /fr, /de, /it,
 * /zh, /ru, /ko.
 */

export type Locale =
  | 'en'
  | 'es'
  | 'pt-br'
  | 'fr'
  | 'de'
  | 'it'
  | 'zh'
  | 'ru'
  | 'ko';

export const SUPPORTED_LOCALES: readonly Locale[] = [
  'en',
  'pt-br',
  'es',
  'fr',
  'de',
  'it',
  'zh',
  'ru',
  'ko',
] as const;

export interface EndpointDoc {
  method: 'GET';
  path: string;
  description: string;
  exampleCall: string;
  params?: Array<{ name: string; type: string; required?: boolean; description: string }>;
}

export interface EndpointGroup {
  group: string;
  items: EndpointDoc[];
}

export interface Translations {
  htmlLang: string;
  meta: {
    title: string;
    description: string;
  };
  nav: {
    skipToContent: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  features: {
    title: string;
    cards: Array<{ title: string; body: string }>;
  };
  quickStart: {
    title: string;
    subtitle: string;
    runIt: string;
  };
  versions: {
    title: string;
    subtitle: string;
    countSingular: string;
    countPlural: string;
    languageNames: Record<string, string>;
  };
  endpoints: {
    title: string;
    subtitle: string;
    paramsLabel: string;
    paramRequired: string;
    paramOptional: string;
    runBtn: string;
    runningBtn: string;
    responseLabel: string;
    errorLabel: string;
    copyBtn: string;
    copiedBtn: string;
    groups: EndpointGroup[];
  };
  footer: {
    builtBy: string;
    tagline: string;
    ecosystemLabel: string;
    productsLabel: string;
    openSourceLabel: string;
    allReposLabel: string;
    soonLabel: string;
    ecosystem: Array<{
      label: string;
      href?: string;
      iconKey: 'reader' | 'api' | 'mcp' | 'wordpress' | 'chrome' | 'ios' | 'android';
      current?: boolean;
      soon?: boolean;
    }>;
    socialLabel: string;
    instagramLabel: string;
    copyright: string;
  };
}

interface GroupStrings {
  listVersions: string;
  versionDetail: string;
  listBooks: string;
  bookDetail: string;
  chapter: string;
  verse: string;
  votd: string;
  gContent: string;
  gReference: string;
  pVersionPath: string;
  pBookPath: string;
  pChapterPath: string;
  pVerseRangePath: string;
  pSlugPath: string;
  pLanguageQ: string;
  pTestamentQ: string;
  pVotdLanguageQ: string;
  pVotdVersionQ: string;
}

const GROUP_STRINGS: Record<Locale, GroupStrings> = {
  en: {
    listVersions: 'List all available Bible versions ({versions})',
    versionDetail: 'Get metadata for a specific version',
    listBooks: 'List the 66 Bible books',
    bookDetail: 'Get metadata for a single book (accepts slugs in any language)',
    chapter: 'Get a full Bible chapter',
    verse: 'Get a single verse or range (16 or 16-20)',
    votd: 'Verse of the day — same verse for every user on the same UTC day (cached 24h)',
    gContent: 'Bible content',
    gReference: 'Versions & books',
    pVersionPath: 'Version slug (e.g. nvi, kjv)',
    pBookPath: 'Book slug in any language',
    pChapterPath: 'Chapter number',
    pVerseRangePath: 'Single verse (16) or range (16-20)',
    pSlugPath: 'Slug in any language',
    pLanguageQ: 'Filter by ISO language code (see /v1/versions for the full list)',
    pTestamentQ: '"old" or "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Defaults to en.',
    pVotdVersionQ: 'Version slug. Defaults to the canonical version of the chosen locale.',
  },
  'pt-br': {
    listVersions: 'Lista todas as versões bíblicas ({versions})',
    versionDetail: 'Retorna metadados de uma versão específica',
    listBooks: 'Lista os 66 livros da Bíblia',
    bookDetail: 'Retorna metadados de um livro (aceita slug em qualquer idioma)',
    chapter: 'Retorna um capítulo bíblico completo',
    verse: 'Retorna um versículo único ou intervalo (16 ou 16-20)',
    votd: 'Versículo do dia — mesmo versículo para todos os usuários no mesmo dia UTC (cache de 24h)',
    gContent: 'Conteúdo bíblico',
    gReference: 'Versões e livros',
    pVersionPath: 'Slug da versão (ex.: nvi, kjv)',
    pBookPath: 'Slug do livro em qualquer idioma',
    pChapterPath: 'Número do capítulo',
    pVerseRangePath: 'Versículo único (16) ou intervalo (16-20)',
    pSlugPath: 'Slug em qualquer idioma',
    pLanguageQ: 'Filtra por código ISO do idioma (veja /v1/versions para a lista completa)',
    pTestamentQ: '"old" ou "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Default: en.',
    pVotdVersionQ: 'Slug da versão. Default: versão canônica do locale escolhido.',
  },
  es: {
    listVersions: 'Lista todas las versiones bíblicas ({versions})',
    versionDetail: 'Devuelve los metadatos de una versión específica',
    listBooks: 'Lista los 66 libros de la Biblia',
    bookDetail: 'Devuelve los metadatos de un libro (acepta slug en cualquier idioma)',
    chapter: 'Devuelve un capítulo bíblico completo',
    verse: 'Devuelve un versículo único o un rango (16 o 16-20)',
    votd: 'Versículo del día — el mismo versículo para todos los usuarios en el mismo día UTC (caché de 24h)',
    gContent: 'Contenido bíblico',
    gReference: 'Versiones y libros',
    pVersionPath: 'Slug de la versión (ej.: nvi, kjv)',
    pBookPath: 'Slug del libro en cualquier idioma',
    pChapterPath: 'Número de capítulo',
    pVerseRangePath: 'Versículo único (16) o rango (16-20)',
    pSlugPath: 'Slug en cualquier idioma',
    pLanguageQ: 'Filtra por código ISO de idioma (consulta /v1/versions para la lista completa)',
    pTestamentQ: '"old" o "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Por defecto: en.',
    pVotdVersionQ: 'Slug de la versión. Por defecto: versión canónica del locale elegido.',
  },
  fr: {
    listVersions: 'Liste toutes les versions bibliques disponibles ({versions})',
    versionDetail: "Renvoie les métadonnées d'une version spécifique",
    listBooks: 'Liste les 66 livres de la Bible',
    bookDetail: "Renvoie les métadonnées d'un livre (slug accepté dans n'importe quelle langue)",
    chapter: 'Renvoie un chapitre biblique complet',
    verse: 'Renvoie un verset unique ou une plage (16 ou 16-20)',
    votd: 'Verset du jour — même verset pour tous les utilisateurs le même jour UTC (cache de 24 h)',
    gContent: 'Contenu biblique',
    gReference: 'Versions et livres',
    pVersionPath: 'Slug de la version (ex. : nvi, kjv)',
    pBookPath: "Slug du livre dans n'importe quelle langue",
    pChapterPath: 'Numéro de chapitre',
    pVerseRangePath: 'Verset unique (16) ou plage (16-20)',
    pSlugPath: "Slug dans n'importe quelle langue",
    pLanguageQ: 'Filtrer par code de langue ISO (voir /v1/versions pour la liste complète)',
    pTestamentQ: '"old" ou "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Par défaut : en.',
    pVotdVersionQ: 'Slug de la version. Par défaut : version canonique du locale choisi.',
  },
  de: {
    listVersions: 'Listet alle verfügbaren Bibelübersetzungen auf ({versions})',
    versionDetail: 'Liefert Metadaten zu einer bestimmten Übersetzung',
    listBooks: 'Listet die 66 Bücher der Bibel auf',
    bookDetail: 'Liefert Metadaten zu einem Buch (Slug in beliebiger Sprache)',
    chapter: 'Liefert ein vollständiges Bibelkapitel',
    verse: 'Liefert einen einzelnen Vers oder einen Bereich (16 oder 16-20)',
    votd: 'Vers des Tages — derselbe Vers für alle Nutzer am selben UTC-Tag (24 h Cache)',
    gContent: 'Bibelinhalt',
    gReference: 'Übersetzungen & Bücher',
    pVersionPath: 'Übersetzungs-Slug (z. B. nvi, kjv)',
    pBookPath: 'Buch-Slug in beliebiger Sprache',
    pChapterPath: 'Kapitelnummer',
    pVerseRangePath: 'Einzelner Vers (16) oder Bereich (16-20)',
    pSlugPath: 'Slug in beliebiger Sprache',
    pLanguageQ: 'Nach ISO-Sprachcode filtern (siehe /v1/versions für die vollständige Liste)',
    pTestamentQ: '"old" oder "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Standard: en.',
    pVotdVersionQ: 'Übersetzungs-Slug. Standard: kanonische Übersetzung des gewählten Locales.',
  },
  it: {
    listVersions: 'Elenca tutte le versioni bibliche disponibili ({versions})',
    versionDetail: 'Restituisce i metadati di una versione specifica',
    listBooks: 'Elenca i 66 libri della Bibbia',
    bookDetail: 'Restituisce i metadati di un libro (slug in qualsiasi lingua)',
    chapter: 'Restituisce un capitolo biblico completo',
    verse: 'Restituisce un singolo versetto o un intervallo (16 o 16-20)',
    votd: 'Versetto del giorno — stesso versetto per tutti gli utenti nello stesso giorno UTC (cache 24h)',
    gContent: 'Contenuto biblico',
    gReference: 'Versioni e libri',
    pVersionPath: 'Slug della versione (es. nvi, kjv)',
    pBookPath: 'Slug del libro in qualsiasi lingua',
    pChapterPath: 'Numero del capitolo',
    pVerseRangePath: 'Singolo versetto (16) o intervallo (16-20)',
    pSlugPath: 'Slug in qualsiasi lingua',
    pLanguageQ: "Filtra per codice ISO della lingua (vedi /v1/versions per l'elenco completo)",
    pTestamentQ: '"old" o "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Predefinito: en.',
    pVotdVersionQ: 'Slug della versione. Predefinito: versione canonica del locale scelto.',
  },
  zh: {
    listVersions: '列出全部圣经版本（{versions} 个）',
    versionDetail: '返回指定版本的元数据',
    listBooks: '列出圣经全部 66 卷书',
    bookDetail: '返回单卷书的元数据（支持任意语言的 slug）',
    chapter: '返回完整的圣经章节',
    verse: '返回单节或一段经文（16 或 16-20）',
    votd: '每日经文 — 同一 UTC 日期下所有用户获得同一节经文（缓存 24 小时）',
    gContent: '圣经内容',
    gReference: '版本与书卷',
    pVersionPath: '版本 slug（例：nvi、kjv）',
    pBookPath: '任意语言的书卷 slug',
    pChapterPath: '章节序号',
    pVerseRangePath: '单节（16）或经文段（16-20）',
    pSlugPath: '任意语言的 slug',
    pLanguageQ: '按 ISO 语言代码过滤（完整列表见 /v1/versions）',
    pTestamentQ: '"old" 或 "new"',
    pVotdLanguageQ: '语言（en、pt-br、es、fr、de、it、zh、ru、ko），默认 en。',
    pVotdVersionQ: '版本 slug，默认使用所选语言的官方版本。',
  },
  ru: {
    listVersions: 'Список всех доступных переводов Библии ({versions})',
    versionDetail: 'Возвращает метаданные конкретного перевода',
    listBooks: 'Список 66 книг Библии',
    bookDetail: 'Возвращает метаданные книги (slug на любом языке)',
    chapter: 'Возвращает полную главу Библии',
    verse: 'Возвращает один стих или диапазон (16 или 16-20)',
    votd: 'Стих дня — один и тот же стих для всех пользователей в один UTC-день (кэш 24 ч)',
    gContent: 'Библейский текст',
    gReference: 'Переводы и книги',
    pVersionPath: 'Slug перевода (например, nvi, kjv)',
    pBookPath: 'Slug книги на любом языке',
    pChapterPath: 'Номер главы',
    pVerseRangePath: 'Один стих (16) или диапазон (16-20)',
    pSlugPath: 'Slug на любом языке',
    pLanguageQ: 'Фильтр по коду языка ISO (полный список — /v1/versions)',
    pTestamentQ: '"old" или "new"',
    pVotdLanguageQ: 'Локаль (en, pt-br, es, fr, de, it, zh, ru, ko). По умолчанию: en.',
    pVotdVersionQ: 'Slug перевода. По умолчанию — канонический перевод выбранной локали.',
  },
  ko: {
    listVersions: '모든 성경 번역본을 나열합니다 ({versions}개)',
    versionDetail: '특정 번역본의 메타데이터를 반환합니다',
    listBooks: '성경 66권 목록을 반환합니다',
    bookDetail: '단일 책의 메타데이터 반환 (모든 언어의 slug 허용)',
    chapter: '전체 성경 장을 반환합니다',
    verse: '단일 절 또는 범위를 반환합니다 (16 또는 16-20)',
    votd: '오늘의 말씀 — 같은 UTC 날짜의 모든 사용자에게 동일한 절을 반환 (24시간 캐시)',
    gContent: '성경 본문',
    gReference: '번역본 및 책',
    pVersionPath: '번역본 slug (예: nvi, kjv)',
    pBookPath: '모든 언어의 책 slug',
    pChapterPath: '장 번호',
    pVerseRangePath: '단일 절 (16) 또는 범위 (16-20)',
    pSlugPath: '모든 언어의 slug',
    pLanguageQ: 'ISO 언어 코드로 필터링 (전체 목록은 /v1/versions 참조)',
    pTestamentQ: '"old" 또는 "new"',
    pVotdLanguageQ: '로케일 (en, pt-br, es, fr, de, it, zh, ru, ko). 기본값: en.',
    pVotdVersionQ: '번역본 slug. 기본값: 선택한 로케일의 표준 번역본.',
  },
};

const COMMON_GROUPS = (lang: Locale): EndpointGroup[] => {
  const t = GROUP_STRINGS[lang];

  return [
    {
      group: t.gContent,
      items: [
        {
          method: 'GET',
          path: '/v1/{version}/{book}/{chapter}',
          description: t.chapter,
          exampleCall: '/v1/nvi/john/3',
          params: [
            { name: 'version', type: 'path', required: true, description: t.pVersionPath },
            { name: 'book', type: 'path', required: true, description: t.pBookPath },
            { name: 'chapter', type: 'path', required: true, description: t.pChapterPath },
          ],
        },
        {
          method: 'GET',
          path: '/v1/{version}/{book}/{chapter}/{verse}',
          description: t.verse,
          exampleCall: '/v1/nvi/john/3/16',
          params: [
            { name: 'version', type: 'path', required: true, description: t.pVersionPath },
            { name: 'book', type: 'path', required: true, description: t.pBookPath },
            { name: 'chapter', type: 'path', required: true, description: t.pChapterPath },
            { name: 'verse', type: 'path', required: true, description: t.pVerseRangePath },
          ],
        },
        {
          method: 'GET',
          path: '/v1/votd',
          description: t.votd,
          exampleCall: '/v1/votd?language=pt-br',
          params: [
            { name: 'language', type: 'query', description: t.pVotdLanguageQ },
            { name: 'version', type: 'query', description: t.pVotdVersionQ },
          ],
        },
      ],
    },
    {
      group: t.gReference,
      items: [
        {
          method: 'GET',
          path: '/v1/versions',
          description: t.listVersions,
          exampleCall: '/v1/versions',
          params: [{ name: 'language', type: 'query', description: t.pLanguageQ }],
        },
        {
          method: 'GET',
          path: '/v1/versions/{slug}',
          description: t.versionDetail,
          exampleCall: '/v1/versions/nvi',
          params: [{ name: 'slug', type: 'path', required: true, description: t.pSlugPath }],
        },
        {
          method: 'GET',
          path: '/v1/books',
          description: t.listBooks,
          exampleCall: '/v1/books',
          params: [{ name: 'testament', type: 'query', description: t.pTestamentQ }],
        },
        {
          method: 'GET',
          path: '/v1/books/{slug}',
          description: t.bookDetail,
          exampleCall: '/v1/books/genesis',
          params: [{ name: 'slug', type: 'path', required: true, description: t.pSlugPath }],
        },
      ],
    },
  ];
};

const en: Translations = {
  htmlLang: 'en',
  meta: {
    title: 'Bible API by Midvash — free & public, {versions} versions in {languages} languages',
    description:
      'Public, free, and edge-cached REST API for Bible content in {versions} versions and {languages} languages. Verses, chapters, books and version metadata.',
  },
  nav: { skipToContent: 'Skip to content' },
  hero: {
    eyebrow: 'Free · Public · Cached at edge',
    title: 'The Bible API',
    titleAccent: 'by Midvash',
    subtitle:
      'Build with the Bible. {versions} versions, {languages} languages, free forever — JSON over HTTP, no signup, no API keys.',
    ctaPrimary: 'Browse endpoints',
    ctaSecondary: 'Quick start',
  },
  features: {
    title: 'Why Midvash API',
    cards: [
      { title: '{versions} Bible versions', body: 'NIV, KJV, ESV, NVI, RVR1960 and many more — across {languages} languages.' },
      { title: 'Edge cached', body: 'Sub-50ms responses worldwide via Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Stable v1 schema with { data, meta } responses and structured errors.' },
      { title: 'Free forever', body: 'No signup, no API keys, no rate limits beyond fair use.' },
    ],
  },
  quickStart: {
    title: 'Get a verse in one call',
    subtitle: 'Hit the API directly — no setup, no auth.',
    runIt: 'Try this call',
  },
  versions: {
    title: 'Available Bible versions',
    subtitle: 'All {versions} versions are served from the same endpoints. Click any to fetch its metadata.',
    countSingular: 'version',
    countPlural: 'versions',
    languageNames: {
      en: 'English', 'pt-br': 'Português', 'pt-pt': 'Português (PT)',
      es: 'Español', he: 'עברית · Hebrew', gr: 'Ελληνικά · Greek', la: 'Latina',
      fr: 'Français', it: 'Italiano',
      de: 'Deutsch', zh: '中文 · Chinese', ru: 'Русский · Russian',
      ko: '한국어 · Korean', ar: 'العربية · Arabic', ja: '日本語 · Japanese',
      pl: 'Polski', nl: 'Nederlands', ro: 'Română', hu: 'Magyar', cs: 'Čeština',
      tl: 'Tagalog', vi: 'Tiếng Việt', tr: 'Türkçe', id: 'Bahasa Indonesia',
      uk: 'Українська', sv: 'Svenska', da: 'Dansk', nb: 'Norsk',
      eo: 'Esperanto', sw: 'Kiswahili',
      fi: 'Suomi', sr: 'Српски · Serbian',
    },
  },
  endpoints: {
    title: 'API reference',
    subtitle: 'All v1 endpoints. Click "Try it" to make a real request and see the JSON response.',
    paramsLabel: 'Parameters',
    paramRequired: 'required',
    paramOptional: 'optional',
    runBtn: 'Try it',
    runningBtn: 'Running…',
    responseLabel: 'Response',
    errorLabel: 'Error',
    copyBtn: 'Copy',
    copiedBtn: 'Copied!',
    groups: COMMON_GROUPS('en'),
  },
  footer: {
    builtBy: 'Built by',
    tagline: 'Open source · Free forever · No signup',
    ecosystemLabel: 'Midvash ecosystem',
    ecosystem: [
      { label: 'Bible reader', href: 'https://midvash.com', iconKey: 'reader' },
      { label: 'Bible API', href: 'https://api.midvash.com', iconKey: 'api', current: true },
      { label: 'Bible MCP', href: 'https://mcp.midvash.com', iconKey: 'mcp' },
      { label: 'WordPress plugin', href: 'https://wordpress.midvash.com', iconKey: 'wordpress' },
      { label: 'Chrome extension', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'iOS app', iconKey: 'ios', soon: true },
      { label: 'Android app', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Products',
    openSourceLabel: 'Open source',
    allReposLabel: 'All repositories',
    soonLabel: 'Soon',
    socialLabel: 'Follow us',
    instagramLabel: 'Visit our Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. All rights reserved.`,
  },
};

const es: Translations = {
  htmlLang: 'es',
  meta: {
    title: 'API de la Biblia by Midvash — pública y gratuita, {versions} versiones',
    description:
      'API REST pública, gratuita y cacheada en el edge para contenido bíblico en {versions} versiones y {languages} idiomas. Versículos, capítulos, libros y metadatos de versiones.',
  },
  nav: { skipToContent: 'Saltar al contenido' },
  hero: {
    eyebrow: 'Gratis · Pública · Caché en el edge',
    title: 'La API de la Biblia',
    titleAccent: 'by Midvash',
    subtitle:
      'Construye con la Biblia. {versions} versiones, {languages} idiomas, gratis para siempre — JSON sobre HTTP, sin registro, sin claves.',
    ctaPrimary: 'Ver endpoints',
    ctaSecondary: 'Comienzo rápido',
  },
  features: {
    title: 'Por qué Midvash API',
    cards: [
      { title: '{versions} versiones bíblicas', body: 'NVI, RVR1960, NTV, KJV, ESV y muchas más — en {languages} idiomas.' },
      { title: 'Caché en el edge', body: 'Respuestas en menos de 50 ms gracias a Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Esquema v1 estable con respuestas { data, meta } y errores estructurados.' },
      { title: 'Gratis para siempre', body: 'Sin registro, sin claves, sin límites más allá del uso justo.' },
    ],
  },
  quickStart: {
    title: 'Obtén un versículo en una llamada',
    subtitle: 'Llama directamente a la API — sin configuración, sin autenticación.',
    runIt: 'Probar esta llamada',
  },
  versions: {
    title: 'Versiones bíblicas disponibles',
    subtitle: '{versions} versiones servidas por los mismos endpoints. Haz clic en cualquiera para ver sus metadatos.',
    countSingular: 'versión',
    countPlural: 'versiones',
    languageNames: {
      en: 'English', 'pt-br': 'Português', 'pt-pt': 'Português (PT)',
      es: 'Español', he: 'עברית · Hebreo', gr: 'Ελληνικά · Griego', la: 'Latín',
      fr: 'Francés', it: 'Italiano',
      de: 'Alemán', zh: '中文 · Chino', ru: 'Русский · Ruso',
      ko: '한국어 · Coreano', ar: 'العربية · Árabe', ja: '日本語 · Japonés',
      pl: 'Polaco', nl: 'Neerlandés', ro: 'Rumano', hu: 'Húngaro', cs: 'Checo',
      tl: 'Tagalo', vi: 'Vietnamita', tr: 'Turco', id: 'Indonesio',
      uk: 'Ucraniano', sv: 'Sueco', da: 'Danés', nb: 'Noruego',
      eo: 'Esperanto', sw: 'Suajili',
      fi: 'Finés', sr: 'Српски · Serbio',
    },
  },
  endpoints: {
    title: 'Referencia de la API',
    subtitle: 'Todos los endpoints de v1. Haz clic en "Probar" para enviar una petición real y ver la respuesta.',
    paramsLabel: 'Parámetros',
    paramRequired: 'requerido',
    paramOptional: 'opcional',
    runBtn: 'Probar',
    runningBtn: 'Ejecutando…',
    responseLabel: 'Respuesta',
    errorLabel: 'Error',
    copyBtn: 'Copiar',
    copiedBtn: '¡Copiado!',
    groups: COMMON_GROUPS('es'),
  },
  footer: {
    builtBy: 'Construido por',
    tagline: 'Código abierto · Gratis para siempre · Sin registro',
    ecosystemLabel: 'Ecosistema Midvash',
    ecosystem: [
      { label: 'Lector de la Biblia', href: 'https://midvash.com/es', iconKey: 'reader' },
      { label: 'API de la Biblia', href: 'https://api.midvash.com/es', iconKey: 'api', current: true },
      { label: 'MCP de la Biblia', href: 'https://mcp.midvash.com/es', iconKey: 'mcp' },
      { label: 'Plugin para WordPress', href: 'https://wordpress.midvash.com/es', iconKey: 'wordpress' },
      { label: 'Extensión Chrome', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'App iOS', iconKey: 'ios', soon: true },
      { label: 'App Android', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Productos',
    openSourceLabel: 'Código abierto',
    allReposLabel: 'Todos los repositorios',
    soonLabel: 'Pronto',
    socialLabel: 'Síguenos',
    instagramLabel: 'Visite nuestro Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. Todos los derechos reservados.`,
  },
};

const ptBr: Translations = {
  htmlLang: 'pt-BR',
  meta: {
    title: 'API da Bíblia by Midvash — pública e gratuita, {versions} versões',
    description:
      'API REST pública, gratuita e cacheada no edge com conteúdo bíblico em {versions} versões e {languages} idiomas. Versículos, capítulos, livros e metadados de versões.',
  },
  nav: { skipToContent: 'Pular para o conteúdo' },
  hero: {
    eyebrow: 'Grátis · Pública · Cache no edge',
    title: 'A API da Bíblia',
    titleAccent: 'by Midvash',
    subtitle:
      'Construa com a Bíblia. {versions} versões, {languages} idiomas, grátis para sempre — JSON sobre HTTP, sem cadastro, sem chaves de API.',
    ctaPrimary: 'Ver endpoints',
    ctaSecondary: 'Início rápido',
  },
  features: {
    title: 'Por que a Midvash API',
    cards: [
      { title: '{versions} versões da Bíblia', body: 'NVI, ARA, ACF, NAA, NTLH, KJV, NIV e muitas mais — em {languages} idiomas.' },
      { title: 'Cache no edge', body: 'Respostas abaixo de 50ms no mundo todo via Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Schema v1 estável com respostas { data, meta } e erros estruturados.' },
      { title: 'Grátis para sempre', body: 'Sem cadastro, sem chaves, sem limites além do uso razoável.' },
    ],
  },
  quickStart: {
    title: 'Pegue um versículo em uma chamada',
    subtitle: 'Chame a API direto — sem setup, sem autenticação.',
    runIt: 'Testar esta chamada',
  },
  versions: {
    title: 'Versões bíblicas disponíveis',
    subtitle: '{versions} versões servidas pelos mesmos endpoints. Clique em qualquer uma para ver os metadados.',
    countSingular: 'versão',
    countPlural: 'versões',
    languageNames: {
      en: 'English', 'pt-br': 'Português', 'pt-pt': 'Português (PT)',
      es: 'Español', he: 'עברית · Hebraico', gr: 'Ελληνικά · Grego', la: 'Latim',
      fr: 'Francês', it: 'Italiano',
      de: 'Alemão', zh: '中文 · Chinês', ru: 'Русский · Russo',
      ko: '한국어 · Coreano', ar: 'العربية · Árabe', ja: '日本語 · Japonês',
      pl: 'Polonês', nl: 'Holandês', ro: 'Romeno', hu: 'Húngaro', cs: 'Tcheco',
      tl: 'Tagalo', vi: 'Vietnamita', tr: 'Turco', id: 'Indonésio',
      uk: 'Ucraniano', sv: 'Sueco', da: 'Dinamarquês', nb: 'Norueguês',
      eo: 'Esperanto', sw: 'Suaíli',
      fi: 'Finlandês', sr: 'Српски · Sérvio',
    },
  },
  endpoints: {
    title: 'Referência da API',
    subtitle: 'Todos os endpoints da v1. Clique em "Testar" para fazer uma requisição real e ver o JSON.',
    paramsLabel: 'Parâmetros',
    paramRequired: 'obrigatório',
    paramOptional: 'opcional',
    runBtn: 'Testar',
    runningBtn: 'Executando…',
    responseLabel: 'Resposta',
    errorLabel: 'Erro',
    copyBtn: 'Copiar',
    copiedBtn: 'Copiado!',
    groups: COMMON_GROUPS('pt-br'),
  },
  footer: {
    builtBy: 'Construído por',
    tagline: 'Código aberto · Grátis para sempre · Sem cadastro',
    ecosystemLabel: 'Ecossistema Midvash',
    ecosystem: [
      { label: 'Leitor da Bíblia', href: 'https://midvash.com/pt-br', iconKey: 'reader' },
      { label: 'API da Bíblia', href: 'https://api.midvash.com/pt-br', iconKey: 'api', current: true },
      { label: 'MCP da Bíblia', href: 'https://mcp.midvash.com/pt-br', iconKey: 'mcp' },
      { label: 'Plugin para WordPress', href: 'https://wordpress.midvash.com/pt-br', iconKey: 'wordpress' },
      { label: 'Extensão Chrome', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'App iOS', iconKey: 'ios', soon: true },
      { label: 'App Android', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Produtos',
    openSourceLabel: 'Código aberto',
    allReposLabel: 'Todos os repositórios',
    soonLabel: 'Em breve',
    socialLabel: 'Siga a gente',
    instagramLabel: 'Visite nosso Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. Todos os direitos reservados.`,
  },
};

const LANGUAGE_NAMES_BY_LOCALE: Record<Locale, Record<string, string>> = {
  en: {
    en: 'English', 'pt-br': 'Portuguese', 'pt-pt': 'Portuguese (PT)',
    es: 'Spanish', he: 'Hebrew', gr: 'Greek', la: 'Latin', fr: 'French', it: 'Italian',
    de: 'German', zh: 'Chinese', ru: 'Russian', ko: 'Korean', ar: 'Arabic', ja: 'Japanese',
    pl: 'Polish', nl: 'Dutch', ro: 'Romanian', hu: 'Hungarian', cs: 'Czech', tl: 'Tagalog',
    vi: 'Vietnamese', tr: 'Turkish', id: 'Indonesian', uk: 'Ukrainian', sv: 'Swedish',
    da: 'Danish', nb: 'Norwegian', eo: 'Esperanto', sw: 'Swahili',
    fi: 'Finnish', sr: 'Serbian',
  },
  'pt-br': {
    en: 'Inglês', 'pt-br': 'Português', 'pt-pt': 'Português (PT)',
    es: 'Espanhol', he: 'Hebraico', gr: 'Grego', la: 'Latim', fr: 'Francês', it: 'Italiano',
    de: 'Alemão', zh: 'Chinês', ru: 'Russo', ko: 'Coreano', ar: 'Árabe', ja: 'Japonês',
    pl: 'Polonês', nl: 'Holandês', ro: 'Romeno', hu: 'Húngaro', cs: 'Tcheco', tl: 'Tagalo',
    vi: 'Vietnamita', tr: 'Turco', id: 'Indonésio', uk: 'Ucraniano', sv: 'Sueco',
    da: 'Dinamarquês', nb: 'Norueguês', eo: 'Esperanto', sw: 'Suaíli',
    fi: 'Finlandês', sr: 'Sérvio',
  },
  es: {
    en: 'Inglés', 'pt-br': 'Portugués', 'pt-pt': 'Portugués (PT)',
    es: 'Español', he: 'Hebreo', gr: 'Griego', la: 'Latín', fr: 'Francés', it: 'Italiano',
    de: 'Alemán', zh: 'Chino', ru: 'Ruso', ko: 'Coreano', ar: 'Árabe', ja: 'Japonés',
    pl: 'Polaco', nl: 'Neerlandés', ro: 'Rumano', hu: 'Húngaro', cs: 'Checo', tl: 'Tagalo',
    vi: 'Vietnamita', tr: 'Turco', id: 'Indonesio', uk: 'Ucraniano', sv: 'Sueco',
    da: 'Danés', nb: 'Noruego', eo: 'Esperanto', sw: 'Suajili',
    fi: 'Finés', sr: 'Serbio',
  },
  fr: {
    en: 'Anglais', 'pt-br': 'Portugais', 'pt-pt': 'Portugais (PT)',
    es: 'Espagnol', he: 'Hébreu', gr: 'Grec', la: 'Latin', fr: 'Français', it: 'Italien',
    de: 'Allemand', zh: 'Chinois', ru: 'Russe', ko: 'Coréen', ar: 'Arabe', ja: 'Japonais',
    pl: 'Polonais', nl: 'Néerlandais', ro: 'Roumain', hu: 'Hongrois', cs: 'Tchèque', tl: 'Tagalog',
    vi: 'Vietnamien', tr: 'Turc', id: 'Indonésien', uk: 'Ukrainien', sv: 'Suédois',
    da: 'Danois', nb: 'Norvégien', eo: 'Espéranto', sw: 'Swahili',
    fi: 'Finnois', sr: 'Serbe',
  },
  de: {
    en: 'Englisch', 'pt-br': 'Portugiesisch', 'pt-pt': 'Portugiesisch (PT)',
    es: 'Spanisch', he: 'Hebräisch', gr: 'Griechisch', la: 'Latein', fr: 'Französisch', it: 'Italienisch',
    de: 'Deutsch', zh: 'Chinesisch', ru: 'Russisch', ko: 'Koreanisch', ar: 'Arabisch', ja: 'Japanisch',
    pl: 'Polnisch', nl: 'Niederländisch', ro: 'Rumänisch', hu: 'Ungarisch', cs: 'Tschechisch', tl: 'Tagalog',
    vi: 'Vietnamesisch', tr: 'Türkisch', id: 'Indonesisch', uk: 'Ukrainisch', sv: 'Schwedisch',
    da: 'Dänisch', nb: 'Norwegisch', eo: 'Esperanto', sw: 'Swahili',
    fi: 'Finnisch', sr: 'Serbisch',
  },
  it: {
    en: 'Inglese', 'pt-br': 'Portoghese', 'pt-pt': 'Portoghese (PT)',
    es: 'Spagnolo', he: 'Ebraico', gr: 'Greco', la: 'Latino', fr: 'Francese', it: 'Italiano',
    de: 'Tedesco', zh: 'Cinese', ru: 'Russo', ko: 'Coreano', ar: 'Arabo', ja: 'Giapponese',
    pl: 'Polacco', nl: 'Olandese', ro: 'Rumeno', hu: 'Ungherese', cs: 'Ceco', tl: 'Tagalog',
    vi: 'Vietnamita', tr: 'Turco', id: 'Indonesiano', uk: 'Ucraino', sv: 'Svedese',
    da: 'Danese', nb: 'Norvegese', eo: 'Esperanto', sw: 'Swahili',
    fi: 'Finlandese', sr: 'Serbo',
  },
  zh: {
    en: '英语', 'pt-br': '葡萄牙语', 'pt-pt': '葡萄牙语（葡）',
    es: '西班牙语', he: '希伯来语', gr: '希腊语', la: '拉丁语', fr: '法语', it: '意大利语',
    de: '德语', zh: '中文', ru: '俄语', ko: '韩语', ar: '阿拉伯语', ja: '日语',
    pl: '波兰语', nl: '荷兰语', ro: '罗马尼亚语', hu: '匈牙利语', cs: '捷克语', tl: '他加禄语',
    vi: '越南语', tr: '土耳其语', id: '印尼语', uk: '乌克兰语', sv: '瑞典语',
    da: '丹麦语', nb: '挪威语', eo: '世界语', sw: '斯瓦希里语',
    fi: '芬兰语', sr: '塞尔维亚语',
  },
  ru: {
    en: 'Английский', 'pt-br': 'Португальский', 'pt-pt': 'Португальский (PT)',
    es: 'Испанский', he: 'Иврит', gr: 'Греческий', la: 'Латынь', fr: 'Французский', it: 'Итальянский',
    de: 'Немецкий', zh: 'Китайский', ru: 'Русский', ko: 'Корейский', ar: 'Арабский', ja: 'Японский',
    pl: 'Польский', nl: 'Нидерландский', ro: 'Румынский', hu: 'Венгерский', cs: 'Чешский', tl: 'Тагальский',
    vi: 'Вьетнамский', tr: 'Турецкий', id: 'Индонезийский', uk: 'Украинский', sv: 'Шведский',
    da: 'Датский', nb: 'Норвежский', eo: 'Эсперанто', sw: 'Суахили',
    fi: 'Финский', sr: 'Сербский',
  },
  ko: {
    en: '영어', 'pt-br': '포르투갈어', 'pt-pt': '포르투갈어 (PT)',
    es: '스페인어', he: '히브리어', gr: '그리스어', la: '라틴어', fr: '프랑스어', it: '이탈리아어',
    de: '독일어', zh: '중국어', ru: '러시아어', ko: '한국어', ar: '아랍어', ja: '일본어',
    pl: '폴란드어', nl: '네덜란드어', ro: '루마니아어', hu: '헝가리어', cs: '체코어', tl: '타갈로그어',
    vi: '베트남어', tr: '터키어', id: '인도네시아어', uk: '우크라이나어', sv: '스웨덴어',
    da: '덴마크어', nb: '노르웨이어', eo: '에스페란토어', sw: '스와힐리어',
    fi: '핀란드어', sr: '세르비아어',
  },
};

const fr: Translations = {
  htmlLang: 'fr',
  meta: {
    title: 'API de la Bible by Midvash — publique et gratuite, {versions} versions',
    description:
      "API REST publique, gratuite et mise en cache à l'edge avec le contenu de la Bible en {versions} versions et {languages} langues. Versets, chapitres, livres et métadonnées des versions.",
  },
  nav: { skipToContent: 'Aller au contenu' },
  hero: {
    eyebrow: 'Gratuite · Publique · Cache à l\'edge',
    title: "L'API de la Bible",
    titleAccent: 'by Midvash',
    subtitle:
      'Construisez avec la Bible. {versions} versions, {languages} langues, gratuite à vie — JSON via HTTP, sans inscription, sans clé d\'API.',
    ctaPrimary: 'Voir les endpoints',
    ctaSecondary: 'Démarrage rapide',
  },
  features: {
    title: 'Pourquoi Midvash API',
    cards: [
      { title: '{versions} versions de la Bible', body: 'NIV, KJV, ESV, NVI, RVR1960 et bien plus — dans {languages} langues.' },
      { title: 'Cache à l\'edge', body: 'Réponses sous 50 ms partout dans le monde via Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Schéma v1 stable avec réponses { data, meta } et erreurs structurées.' },
      { title: 'Gratuite à vie', body: 'Pas d\'inscription, pas de clé, pas de limites au-delà de l\'usage raisonnable.' },
    ],
  },
  quickStart: {
    title: 'Obtenez un verset en un appel',
    subtitle: 'Appelez l\'API directement — sans configuration, sans authentification.',
    runIt: 'Tester cet appel',
  },
  versions: {
    title: 'Versions bibliques disponibles',
    subtitle: '{versions} versions servies par les mêmes endpoints. Cliquez pour voir les métadonnées.',
    countSingular: 'version',
    countPlural: 'versions',
    languageNames: LANGUAGE_NAMES_BY_LOCALE.fr,
  },
  endpoints: {
    title: 'Référence de l\'API',
    subtitle: 'Tous les endpoints v1. Cliquez sur "Tester" pour faire une vraie requête et voir le JSON.',
    paramsLabel: 'Paramètres',
    paramRequired: 'requis',
    paramOptional: 'optionnel',
    runBtn: 'Tester',
    runningBtn: 'En cours…',
    responseLabel: 'Réponse',
    errorLabel: 'Erreur',
    copyBtn: 'Copier',
    copiedBtn: 'Copié !',
    groups: COMMON_GROUPS('fr'),
  },
  footer: {
    builtBy: 'Construit par',
    tagline: 'Open source · Gratuite à vie · Sans inscription',
    ecosystemLabel: 'Écosystème Midvash',
    ecosystem: [
      { label: 'Lecteur de Bible', href: 'https://midvash.com/fr', iconKey: 'reader' },
      { label: 'API de la Bible', href: 'https://api.midvash.com/fr', iconKey: 'api', current: true },
      { label: 'MCP de la Bible', href: 'https://mcp.midvash.com/fr', iconKey: 'mcp' },
      { label: 'Plugin WordPress', href: 'https://wordpress.midvash.com/fr', iconKey: 'wordpress' },
      { label: 'Extension Chrome', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'App iOS', iconKey: 'ios', soon: true },
      { label: 'App Android', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Produits',
    openSourceLabel: 'Open source',
    allReposLabel: 'Tous les dépôts',
    soonLabel: 'Bientôt',
    socialLabel: 'Suivez-nous',
    instagramLabel: 'Visitez notre Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. Tous droits réservés.`,
  },
};

const de: Translations = {
  htmlLang: 'de',
  meta: {
    title: 'Bibel-API by Midvash — kostenlos & öffentlich, {versions} Übersetzungen',
    description:
      'Öffentliche, kostenlose und am Edge gecachte REST-API für Bibelinhalte in {versions} Übersetzungen und {languages} Sprachen. Verse, Kapitel, Bücher und Metadaten zu Übersetzungen.',
  },
  nav: { skipToContent: 'Zum Inhalt springen' },
  hero: {
    eyebrow: 'Kostenlos · Öffentlich · Edge-Cache',
    title: 'Die Bibel-API',
    titleAccent: 'by Midvash',
    subtitle:
      'Entwickeln Sie mit der Bibel. {versions} Übersetzungen, {languages} Sprachen, für immer kostenlos — JSON über HTTP, keine Anmeldung, keine API-Keys.',
    ctaPrimary: 'Endpoints ansehen',
    ctaSecondary: 'Schnellstart',
  },
  features: {
    title: 'Warum Midvash API',
    cards: [
      { title: '{versions} Bibelübersetzungen', body: 'NIV, KJV, ESV, NVI, RVR1960 und viele weitere — in {languages} Sprachen.' },
      { title: 'Edge-Cache', body: 'Antworten unter 50 ms weltweit über Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Stabiles v1-Schema mit { data, meta }-Antworten und strukturierten Fehlern.' },
      { title: 'Für immer kostenlos', body: 'Keine Anmeldung, keine Keys, keine Limits abseits fairer Nutzung.' },
    ],
  },
  quickStart: {
    title: 'Holen Sie sich einen Vers in einem Aufruf',
    subtitle: 'Rufen Sie die API direkt auf — ohne Setup, ohne Auth.',
    runIt: 'Diesen Aufruf testen',
  },
  versions: {
    title: 'Verfügbare Bibelübersetzungen',
    subtitle: '{versions} Übersetzungen über dieselben Endpoints. Klicken Sie für Metadaten.',
    countSingular: 'Übersetzung',
    countPlural: 'Übersetzungen',
    languageNames: LANGUAGE_NAMES_BY_LOCALE.de,
  },
  endpoints: {
    title: 'API-Referenz',
    subtitle: 'Alle v1-Endpoints. Klicken Sie auf „Testen", um eine echte Anfrage zu senden.',
    paramsLabel: 'Parameter',
    paramRequired: 'erforderlich',
    paramOptional: 'optional',
    runBtn: 'Testen',
    runningBtn: 'Läuft…',
    responseLabel: 'Antwort',
    errorLabel: 'Fehler',
    copyBtn: 'Kopieren',
    copiedBtn: 'Kopiert!',
    groups: COMMON_GROUPS('de'),
  },
  footer: {
    builtBy: 'Gebaut von',
    tagline: 'Open Source · Für immer kostenlos · Keine Anmeldung',
    ecosystemLabel: 'Midvash-Ökosystem',
    ecosystem: [
      { label: 'Bibel-Reader', href: 'https://midvash.com/de', iconKey: 'reader' },
      { label: 'Bibel-API', href: 'https://api.midvash.com/de', iconKey: 'api', current: true },
      { label: 'Bibel-MCP', href: 'https://mcp.midvash.com/de', iconKey: 'mcp' },
      { label: 'WordPress-Plugin', href: 'https://wordpress.midvash.com/de', iconKey: 'wordpress' },
      { label: 'Chrome-Erweiterung', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'iOS-App', iconKey: 'ios', soon: true },
      { label: 'Android-App', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Produkte',
    openSourceLabel: 'Open Source',
    allReposLabel: 'Alle Repositories',
    soonLabel: 'Bald',
    socialLabel: 'Folgen Sie uns',
    instagramLabel: 'Besuchen Sie unser Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. Alle Rechte vorbehalten.`,
  },
};

const it: Translations = {
  htmlLang: 'it',
  meta: {
    title: 'API della Bibbia by Midvash — pubblica e gratuita, {versions} versioni',
    description:
      'API REST pubblica, gratuita e con cache edge per i contenuti biblici in {versions} versioni e {languages} lingue. Versetti, capitoli, libri e metadati delle versioni.',
  },
  nav: { skipToContent: 'Vai al contenuto' },
  hero: {
    eyebrow: 'Gratuita · Pubblica · Cache edge',
    title: "L'API della Bibbia",
    titleAccent: 'by Midvash',
    subtitle:
      'Costruisci con la Bibbia. {versions} versioni, {languages} lingue, gratuita per sempre — JSON su HTTP, senza registrazione, senza chiavi API.',
    ctaPrimary: 'Vedi gli endpoint',
    ctaSecondary: 'Avvio rapido',
  },
  features: {
    title: 'Perché Midvash API',
    cards: [
      { title: '{versions} versioni bibliche', body: 'NIV, KJV, ESV, NVI, RVR1960 e molte altre — in {languages} lingue.' },
      { title: 'Cache edge', body: 'Risposte sotto i 50 ms in tutto il mondo via Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Schema v1 stabile con risposte { data, meta } ed errori strutturati.' },
      { title: 'Gratuita per sempre', body: 'Niente registrazione, niente chiavi, niente limiti oltre l\'uso equo.' },
    ],
  },
  quickStart: {
    title: 'Ottieni un versetto con una chiamata',
    subtitle: "Chiama l'API direttamente — senza setup, senza autenticazione.",
    runIt: 'Prova questa chiamata',
  },
  versions: {
    title: 'Versioni bibliche disponibili',
    subtitle: '{versions} versioni servite dagli stessi endpoint. Clicca per i metadati.',
    countSingular: 'versione',
    countPlural: 'versioni',
    languageNames: LANGUAGE_NAMES_BY_LOCALE.it,
  },
  endpoints: {
    title: "Riferimento dell'API",
    subtitle: 'Tutti gli endpoint v1. Clicca "Prova" per fare una richiesta reale e vedere il JSON.',
    paramsLabel: 'Parametri',
    paramRequired: 'obbligatorio',
    paramOptional: 'opzionale',
    runBtn: 'Prova',
    runningBtn: 'In esecuzione…',
    responseLabel: 'Risposta',
    errorLabel: 'Errore',
    copyBtn: 'Copia',
    copiedBtn: 'Copiato!',
    groups: COMMON_GROUPS('it'),
  },
  footer: {
    builtBy: 'Costruito da',
    tagline: 'Open source · Gratuita per sempre · Senza registrazione',
    ecosystemLabel: 'Ecosistema Midvash',
    ecosystem: [
      { label: 'Lettore della Bibbia', href: 'https://midvash.com/it', iconKey: 'reader' },
      { label: 'API della Bibbia', href: 'https://api.midvash.com/it', iconKey: 'api', current: true },
      { label: 'MCP della Bibbia', href: 'https://mcp.midvash.com/it', iconKey: 'mcp' },
      { label: 'Plugin WordPress', href: 'https://wordpress.midvash.com/it', iconKey: 'wordpress' },
      { label: 'Estensione Chrome', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'App iOS', iconKey: 'ios', soon: true },
      { label: 'App Android', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Prodotti',
    openSourceLabel: 'Open source',
    allReposLabel: 'Tutti i repository',
    soonLabel: 'Presto',
    socialLabel: 'Seguici',
    instagramLabel: 'Visita il nostro Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. Tutti i diritti riservati.`,
  },
};

const zh: Translations = {
  htmlLang: 'zh',
  meta: {
    title: '圣经 API by Midvash — 免费公开，{versions} 个版本',
    description:
      '免费公开的 REST API，提供 {versions} 圣经版本与 {languages} 种语言的内容，支持边缘缓存。包含经文、章节、书卷及版本元数据。',
  },
  nav: { skipToContent: '跳到主要内容' },
  hero: {
    eyebrow: '免费 · 公开 · 边缘缓存',
    title: '圣经 API',
    titleAccent: 'by Midvash',
    subtitle:
      '基于圣经构建应用。{versions} 版本，{languages} 种语言，永久免费 — 通过 HTTP 返回 JSON，无需注册，无需 API 密钥。',
    ctaPrimary: '查看接口',
    ctaSecondary: '快速开始',
  },
  features: {
    title: '为什么选择 Midvash API',
    cards: [
      { title: '{versions} 圣经版本', body: 'NIV、KJV、ESV、NVI、RVR1960 等众多版本，覆盖 {languages} 种语言。' },
      { title: '边缘缓存', body: '通过 Cloudflare R2 + Cache API 全球响应低于 50ms。' },
      { title: 'REST + JSON', body: '稳定的 v1 架构，统一返回 { data, meta } 与结构化错误。' },
      { title: '永久免费', body: '无需注册、无需密钥，仅遵守合理使用规则。' },
    ],
  },
  quickStart: {
    title: '一次调用获取一节经文',
    subtitle: '直接调用 API — 无需配置，无需认证。',
    runIt: '试一下',
  },
  versions: {
    title: '可用的圣经版本',
    subtitle: '所有 {versions} 版本由相同接口提供，点击任意版本查看元数据。',
    countSingular: '个版本',
    countPlural: '个版本',
    languageNames: LANGUAGE_NAMES_BY_LOCALE.zh,
  },
  endpoints: {
    title: 'API 参考',
    subtitle: '全部 v1 接口。点击"试一下"发起真实请求并查看 JSON 响应。',
    paramsLabel: '参数',
    paramRequired: '必填',
    paramOptional: '可选',
    runBtn: '试一下',
    runningBtn: '运行中…',
    responseLabel: '响应',
    errorLabel: '错误',
    copyBtn: '复制',
    copiedBtn: '已复制！',
    groups: COMMON_GROUPS('zh'),
  },
  footer: {
    builtBy: '由',
    tagline: '开源 · 永久免费 · 无需注册',
    ecosystemLabel: 'Midvash 生态',
    ecosystem: [
      { label: '圣经阅读器', href: 'https://midvash.com/zh', iconKey: 'reader' },
      { label: '圣经 API', href: 'https://api.midvash.com/zh', iconKey: 'api', current: true },
      { label: '圣经 MCP', href: 'https://mcp.midvash.com/zh', iconKey: 'mcp' },
      { label: 'WordPress 插件', href: 'https://wordpress.midvash.com/zh', iconKey: 'wordpress' },
      { label: 'Chrome 扩展', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'iOS 应用', iconKey: 'ios', soon: true },
      { label: 'Android 应用', iconKey: 'android', soon: true },
    ],
    productsLabel: '产品',
    openSourceLabel: '开源',
    allReposLabel: '全部仓库',
    soonLabel: '即将',
    socialLabel: '关注我们',
    instagramLabel: '访问我们的 Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash 保留所有权利。`,
  },
};

const ru: Translations = {
  htmlLang: 'ru',
  meta: {
    title: 'API Библии by Midvash — бесплатный и публичный, {versions} переводов',
    description:
      'Публичный, бесплатный и кэшируемый на edge REST API для текста Библии в {versions} переводах и {languages} языках. Стихи, главы, книги и метаданные переводов.',
  },
  nav: { skipToContent: 'Перейти к контенту' },
  hero: {
    eyebrow: 'Бесплатно · Публично · Edge-кэш',
    title: 'API Библии',
    titleAccent: 'by Midvash',
    subtitle:
      'Создавайте с Библией. {versions} переводов, {languages} языков, бесплатно навсегда — JSON по HTTP, без регистрации и без API-ключей.',
    ctaPrimary: 'Смотреть эндпоинты',
    ctaSecondary: 'Быстрый старт',
  },
  features: {
    title: 'Почему Midvash API',
    cards: [
      { title: '{versions} переводов Библии', body: 'NIV, KJV, ESV, NVI, RVR1960 и многие другие — на {languages} языках.' },
      { title: 'Edge-кэш', body: 'Ответы быстрее 50 мс по всему миру через Cloudflare R2 + Cache API.' },
      { title: 'REST + JSON', body: 'Стабильная схема v1 с ответами { data, meta } и структурированными ошибками.' },
      { title: 'Бесплатно навсегда', body: 'Без регистрации, без ключей, без лимитов вне разумного использования.' },
    ],
  },
  quickStart: {
    title: 'Получите стих одним вызовом',
    subtitle: 'Вызывайте API напрямую — без настройки, без авторизации.',
    runIt: 'Запустить вызов',
  },
  versions: {
    title: 'Доступные переводы Библии',
    subtitle: 'Все {versions} переводов отдаются одними и теми же эндпоинтами. Нажмите для метаданных.',
    countSingular: 'перевод',
    countPlural: 'переводов',
    languageNames: LANGUAGE_NAMES_BY_LOCALE.ru,
  },
  endpoints: {
    title: 'Справочник API',
    subtitle: 'Все эндпоинты v1. Нажмите «Запустить», чтобы отправить реальный запрос и увидеть JSON.',
    paramsLabel: 'Параметры',
    paramRequired: 'обязательный',
    paramOptional: 'необязательный',
    runBtn: 'Запустить',
    runningBtn: 'Выполняется…',
    responseLabel: 'Ответ',
    errorLabel: 'Ошибка',
    copyBtn: 'Скопировать',
    copiedBtn: 'Скопировано!',
    groups: COMMON_GROUPS('ru'),
  },
  footer: {
    builtBy: 'Создано',
    tagline: 'Open source · Бесплатно навсегда · Без регистрации',
    ecosystemLabel: 'Экосистема Midvash',
    ecosystem: [
      { label: 'Читалка Библии', href: 'https://midvash.com/ru', iconKey: 'reader' },
      { label: 'API Библии', href: 'https://api.midvash.com/ru', iconKey: 'api', current: true },
      { label: 'MCP Библии', href: 'https://mcp.midvash.com/ru', iconKey: 'mcp' },
      { label: 'Плагин WordPress', href: 'https://wordpress.midvash.com/ru', iconKey: 'wordpress' },
      { label: 'Расширение Chrome', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'Приложение iOS', iconKey: 'ios', soon: true },
      { label: 'Приложение Android', iconKey: 'android', soon: true },
    ],
    productsLabel: 'Продукты',
    openSourceLabel: 'Open source',
    allReposLabel: 'Все репозитории',
    soonLabel: 'Скоро',
    socialLabel: 'Подписывайтесь',
    instagramLabel: 'Посетите наш Instagram',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. Все права защищены.`,
  },
};

const ko: Translations = {
  htmlLang: 'ko',
  meta: {
    title: '성경 API by Midvash — 무료 공개, {versions} 번역본',
    description:
      '엣지 캐시가 적용된 공개·무료 REST API. {versions}개 성경 번역본과 {languages}개 언어의 본문, 절·장·책 및 번역본 메타데이터를 제공합니다.',
  },
  nav: { skipToContent: '본문으로 건너뛰기' },
  hero: {
    eyebrow: '무료 · 공개 · 엣지 캐시',
    title: '성경 API',
    titleAccent: 'by Midvash',
    subtitle:
      '성경으로 만들어 보세요. {versions} 번역본, {languages}개 언어, 영구 무료 — HTTP 기반 JSON, 가입 불필요, API 키 불필요.',
    ctaPrimary: '엔드포인트 보기',
    ctaSecondary: '빠른 시작',
  },
  features: {
    title: 'Midvash API를 선택하는 이유',
    cards: [
      { title: '{versions} 성경 번역본', body: 'NIV, KJV, ESV, NVI, RVR1960 외 다수 — {languages}개 언어.' },
      { title: '엣지 캐시', body: 'Cloudflare R2 + Cache API로 전 세계 50ms 이하 응답.' },
      { title: 'REST + JSON', body: '안정적인 v1 스키마, { data, meta } 응답과 구조화된 오류.' },
      { title: '영구 무료', body: '가입 없음, 키 없음, 합리적 사용 범위 내 제한 없음.' },
    ],
  },
  quickStart: {
    title: '한 번의 호출로 절을 가져오세요',
    subtitle: 'API를 바로 호출 — 설정도, 인증도 필요 없습니다.',
    runIt: '이 호출 실행하기',
  },
  versions: {
    title: '사용 가능한 성경 번역본',
    subtitle: '{versions} 번역본 모두 같은 엔드포인트로 제공됩니다. 클릭하여 메타데이터를 확인하세요.',
    countSingular: '번역본',
    countPlural: '번역본',
    languageNames: LANGUAGE_NAMES_BY_LOCALE.ko,
  },
  endpoints: {
    title: 'API 레퍼런스',
    subtitle: '모든 v1 엔드포인트. "실행"을 누르면 실제 요청을 보내고 JSON 응답을 확인할 수 있습니다.',
    paramsLabel: '매개변수',
    paramRequired: '필수',
    paramOptional: '선택',
    runBtn: '실행',
    runningBtn: '실행 중…',
    responseLabel: '응답',
    errorLabel: '오류',
    copyBtn: '복사',
    copiedBtn: '복사됨!',
    groups: COMMON_GROUPS('ko'),
  },
  footer: {
    builtBy: '제작:',
    tagline: '오픈 소스 · 영구 무료 · 가입 불필요',
    ecosystemLabel: 'Midvash 생태계',
    ecosystem: [
      { label: '성경 리더', href: 'https://midvash.com/ko', iconKey: 'reader' },
      { label: '성경 API', href: 'https://api.midvash.com/ko', iconKey: 'api', current: true },
      { label: '성경 MCP', href: 'https://mcp.midvash.com/ko', iconKey: 'mcp' },
      { label: 'WordPress 플러그인', href: 'https://wordpress.midvash.com/ko', iconKey: 'wordpress' },
      { label: 'Chrome 확장 프로그램', href: 'https://midvash.app/chrome-extension/', iconKey: 'chrome' },
      { label: 'iOS 앱', iconKey: 'ios', soon: true },
      { label: 'Android 앱', iconKey: 'android', soon: true },
    ],
    productsLabel: '제품',
    openSourceLabel: '오픈 소스',
    allReposLabel: '전체 저장소',
    soonLabel: '곧',
    socialLabel: '팔로우',
    instagramLabel: '인스타그램 방문',
    copyright: `© 2025-${new Date().getFullYear()} Midvash. 모든 권리 보유.`,
  },
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  es,
  'pt-br': ptBr,
  fr,
  de,
  it,
  zh,
  ru,
  ko,
};

/**
 * Mapeia uma rota de URL para o locale correspondente.
 *  /        → en (canônico)
 *  /<loc>   → loc (pt-br, es, fr, de, it, zh, ru, ko)
 */
const PATH_TO_LOCALE: Record<string, Locale> = {
  '/pt-br': 'pt-br',
  '/es': 'es',
  '/fr': 'fr',
  '/de': 'de',
  '/it': 'it',
  '/zh': 'zh',
  '/ru': 'ru',
  '/ko': 'ko',
};

export function localeFromPath(pathname: string): Locale | null {
  const clean = pathname.replace(/\/+$/, '');
  if (clean === '' || clean === '/') return 'en';
  return PATH_TO_LOCALE[clean] ?? null;
}

/**
 * Retorna o caminho público correspondente a um locale.
 * Inglês é canônico em "/".
 */
export function pathForLocale(locale: Locale): string {
  if (locale === 'en') return '/';
  return `/${locale}`;
}
