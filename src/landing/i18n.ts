/**
 * Traduções da landing page api.midvash.com para os 9 idiomas suportados.
 * Tokens {versions}, {languages} e {year} são preenchidos em runtime com o
 * catálogo real (ver fillCounts em page.ts). Copy nova: sem travessão.
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
    ctaDocs: string;
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
    /** Nota sobre mostrar `meta.copyright` junto do texto. */
    creditTitle: string;
    creditBody: string;
    /** Nota sobre versão com direitos reservados → alias pra versão livre. */
    aliasTitle: string;
    aliasBody: string;
    labelPublicDomain: string;
    labelTerms: string;
    scopeFull: string;
    scopeOt: string;
    scopeNt: string;
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
  more: {
    title: string;
    subtitle: string;
    mcpTitle: string;
    mcpBody: string;
    wpTitle: string;
    wpBody: string;
    appTitle: string;
    appBody: string;
    cta: string;
  };
  faq: {
    title: string;
    items: Array<{ q: string; a: string }>;
  };
  footer: {
    builtBy: string;
    tagline: string;
    ecosystemLabel: string;
    productsLabel: string;
    openSourceLabel: string;
    allReposLabel: string;
    /** Rótulos do footer; os links são montados em page.ts (por locale). */
    ecosystem: Record<EcosystemKey, string>;
    socialLabel: string;
    instagramLabel: string;
    copyright: string;
  };
}

export type EcosystemKey = 'reader' | 'api' | 'mcp' | 'wordpress' | 'chrome' | 'ios' | 'android';

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
  passages: string;
  parse: string;
  gTools: string;
  pRefsQ: string;
  pVersionQ: string;
  pQ: string;
  pParseVersionQ: string;
  pPreviewQ: string;
}

const GROUP_STRINGS: Record<Locale, GroupStrings> = {
  en: {
    listVersions: "List all available Bible versions ({versions}), with license text",
    versionDetail: 'Get metadata for a specific version',
    listBooks: 'List the 66 Bible books',
    bookDetail: 'Get metadata for a single book (accepts slugs in any language)',
    chapter: 'Get a full Bible chapter',
    verse: 'Get a single verse or range (16 or 16-20)',
    votd: "Verse of the day: the same verse for everyone on the same UTC day, with the version's copyright (cached 24h)",
    gContent: 'Bible content',
    gReference: 'Versions & books',
    pVersionPath: 'Version slug (e.g. kjv, almeida-livre)',
    pBookPath: 'Book slug in any language',
    pChapterPath: 'Chapter number',
    pVerseRangePath: 'Single verse (16) or range (16-20)',
    pSlugPath: 'Slug in any language',
    pLanguageQ: 'Filter by ISO language code (see /v1/versions for the full list)',
    pTestamentQ: '"old" or "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Defaults to en.',
    pVotdVersionQ: 'Version slug. Defaults to the canonical version of the chosen locale.',
    passages: "Fetch up to 50 references in one call. A bad reference fails alone, in its own position.",
    parse: "Parse a free-text reference (in any of the 9 languages) into book, chapter and verses",
    gTools: "Batch & parsing",
    pRefsQ: "Comma-separated references (max. 50)",
    pVersionQ: "Version slug",
    pQ: "Free-text reference, e.g. John 3:16-18",
    pParseVersionQ: "Optional. Validated and echoed back",
    pPreviewQ: "Truncate text to about N characters (40 to 2000), for tooltips",
  },
  'pt-br': {
    listVersions: "Lista todas as versões bíblicas ({versions}), com o texto da licença",
    versionDetail: 'Retorna metadados de uma versão específica',
    listBooks: 'Lista os 66 livros da Bíblia',
    bookDetail: 'Retorna metadados de um livro (aceita slug em qualquer idioma)',
    chapter: 'Retorna um capítulo bíblico completo',
    verse: 'Retorna um versículo único ou intervalo (16 ou 16-20)',
    votd: "Versículo do dia: o mesmo para todos no mesmo dia UTC, com o copyright da versão (cache de 24h)",
    gContent: 'Conteúdo bíblico',
    gReference: 'Versões e livros',
    pVersionPath: 'Slug da versão (ex.: kjv, almeida-livre)',
    pBookPath: 'Slug do livro em qualquer idioma',
    pChapterPath: 'Número do capítulo',
    pVerseRangePath: 'Versículo único (16) ou intervalo (16-20)',
    pSlugPath: 'Slug em qualquer idioma',
    pLanguageQ: 'Filtra por código ISO do idioma (veja /v1/versions para a lista completa)',
    pTestamentQ: '"old" ou "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Default: en.',
    pVotdVersionQ: 'Slug da versão. Default: versão canônica do locale escolhido.',
    passages: "Busca até 50 referências numa chamada. Referência inválida falha sozinha, na própria posição.",
    parse: "Interpreta uma referência em texto livre (em qualquer dos 9 idiomas) e devolve livro, capítulo e versículos",
    gTools: "Lote e interpretação",
    pRefsQ: "Referências separadas por vírgula (máx. 50)",
    pVersionQ: "Slug da versão",
    pQ: "Referência em texto livre, ex.: João 3:16-18",
    pParseVersionQ: "Opcional. É validada e devolvida na resposta",
    pPreviewQ: "Trunca o texto em cerca de N caracteres (40 a 2000), para tooltips",
  },
  es: {
    listVersions: "Lista todas las versiones bíblicas ({versions}), con el texto de la licencia",
    versionDetail: 'Devuelve los metadatos de una versión específica',
    listBooks: 'Lista los 66 libros de la Biblia',
    bookDetail: 'Devuelve los metadatos de un libro (acepta slug en cualquier idioma)',
    chapter: 'Devuelve un capítulo bíblico completo',
    verse: 'Devuelve un versículo único o un rango (16 o 16-20)',
    votd: "Versículo del día: el mismo para todos en el mismo día UTC, con el copyright de la versión (caché de 24h)",
    gContent: 'Contenido bíblico',
    gReference: 'Versiones y libros',
    pVersionPath: 'Slug de la versión (ej.: kjv, almeida-livre)',
    pBookPath: 'Slug del libro en cualquier idioma',
    pChapterPath: 'Número de capítulo',
    pVerseRangePath: 'Versículo único (16) o rango (16-20)',
    pSlugPath: 'Slug en cualquier idioma',
    pLanguageQ: 'Filtra por código ISO de idioma (consulta /v1/versions para la lista completa)',
    pTestamentQ: '"old" o "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Por defecto: en.',
    pVotdVersionQ: 'Slug de la versión. Por defecto: versión canónica del locale elegido.',
    passages: "Obtiene hasta 50 referencias en una llamada. Una referencia inválida falla sola, en su propia posición.",
    parse: "Interpreta una referencia en texto libre (en cualquiera de los 9 idiomas) y devuelve libro, capítulo y versículos",
    gTools: "Lotes y análisis",
    pRefsQ: "Referencias separadas por comas (máx. 50)",
    pVersionQ: "Slug de la versión",
    pQ: "Referencia en texto libre, ej.: Juan 3:16-18",
    pParseVersionQ: "Opcional. Se valida y se devuelve en la respuesta",
    pPreviewQ: "Recorta el texto a unos N caracteres (40 a 2000), para tooltips",
  },
  fr: {
    listVersions: "Liste toutes les versions bibliques disponibles ({versions}), avec le texte de licence",
    versionDetail: "Renvoie les métadonnées d'une version spécifique",
    listBooks: 'Liste les 66 livres de la Bible',
    bookDetail: "Renvoie les métadonnées d'un livre (slug accepté dans n'importe quelle langue)",
    chapter: 'Renvoie un chapitre biblique complet',
    verse: 'Renvoie un verset unique ou une plage (16 ou 16-20)',
    votd: "Verset du jour : le même pour tous le même jour UTC, avec le copyright de la version (cache de 24 h)",
    gContent: 'Contenu biblique',
    gReference: 'Versions et livres',
    pVersionPath: 'Slug de la version (ex. : kjv, almeida-livre)',
    pBookPath: "Slug du livre dans n'importe quelle langue",
    pChapterPath: 'Numéro de chapitre',
    pVerseRangePath: 'Verset unique (16) ou plage (16-20)',
    pSlugPath: "Slug dans n'importe quelle langue",
    pLanguageQ: 'Filtrer par code de langue ISO (voir /v1/versions pour la liste complète)',
    pTestamentQ: '"old" ou "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Par défaut : en.',
    pVotdVersionQ: 'Slug de la version. Par défaut : version canonique du locale choisi.',
    passages: "Récupère jusqu'à 50 références en un appel. Une référence invalide échoue seule, à sa propre position.",
    parse: "Analyse une référence en texte libre (dans l'une des 9 langues) et renvoie livre, chapitre et versets",
    gTools: "Lots et analyse",
    pRefsQ: "Références séparées par des virgules (50 max.)",
    pVersionQ: "Slug de la version",
    pQ: "Référence en texte libre, ex. : Jean 3:16-18",
    pParseVersionQ: "Optionnel. Validé puis renvoyé dans la réponse",
    pPreviewQ: "Tronque le texte à environ N caractères (40 à 2000), pour les infobulles",
  },
  de: {
    listVersions: "Listet alle verfügbaren Bibelübersetzungen auf ({versions}), mit Lizenztext",
    versionDetail: 'Liefert Metadaten zu einer bestimmten Übersetzung',
    listBooks: 'Listet die 66 Bücher der Bibel auf',
    bookDetail: 'Liefert Metadaten zu einem Buch (Slug in beliebiger Sprache)',
    chapter: 'Liefert ein vollständiges Bibelkapitel',
    verse: 'Liefert einen einzelnen Vers oder einen Bereich (16 oder 16-20)',
    votd: "Vers des Tages: derselbe für alle am selben UTC-Tag, mit dem Copyright der Übersetzung (24 h Cache)",
    gContent: 'Bibelinhalt',
    gReference: 'Übersetzungen & Bücher',
    pVersionPath: 'Übersetzungs-Slug (z. B. kjv, almeida-livre)',
    pBookPath: 'Buch-Slug in beliebiger Sprache',
    pChapterPath: 'Kapitelnummer',
    pVerseRangePath: 'Einzelner Vers (16) oder Bereich (16-20)',
    pSlugPath: 'Slug in beliebiger Sprache',
    pLanguageQ: 'Nach ISO-Sprachcode filtern (siehe /v1/versions für die vollständige Liste)',
    pTestamentQ: '"old" oder "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Standard: en.',
    pVotdVersionQ: 'Übersetzungs-Slug. Standard: kanonische Übersetzung des gewählten Locales.',
    passages: "Holt bis zu 50 Stellen in einem Aufruf. Eine ungültige Stelle scheitert allein, an ihrer eigenen Position.",
    parse: "Zerlegt eine Bibelstelle als Freitext (in jeder der 9 Sprachen) in Buch, Kapitel und Verse",
    gTools: "Batch & Parsing",
    pRefsQ: "Kommagetrennte Bibelstellen (max. 50)",
    pVersionQ: "Übersetzungs-Slug",
    pQ: "Bibelstelle als Freitext, z. B. Johannes 3:16-18",
    pParseVersionQ: "Optional. Wird geprüft und zurückgegeben",
    pPreviewQ: "Kürzt den Text auf etwa N Zeichen (40 bis 2000), für Tooltips",
  },
  it: {
    listVersions: "Elenca tutte le versioni bibliche disponibili ({versions}), con il testo della licenza",
    versionDetail: 'Restituisce i metadati di una versione specifica',
    listBooks: 'Elenca i 66 libri della Bibbia',
    bookDetail: 'Restituisce i metadati di un libro (slug in qualsiasi lingua)',
    chapter: 'Restituisce un capitolo biblico completo',
    verse: 'Restituisce un singolo versetto o un intervallo (16 o 16-20)',
    votd: "Versetto del giorno: lo stesso per tutti nello stesso giorno UTC, con il copyright della versione (cache 24h)",
    gContent: 'Contenuto biblico',
    gReference: 'Versioni e libri',
    pVersionPath: 'Slug della versione (es. kjv, almeida-livre)',
    pBookPath: 'Slug del libro in qualsiasi lingua',
    pChapterPath: 'Numero del capitolo',
    pVerseRangePath: 'Singolo versetto (16) o intervallo (16-20)',
    pSlugPath: 'Slug in qualsiasi lingua',
    pLanguageQ: "Filtra per codice ISO della lingua (vedi /v1/versions per l'elenco completo)",
    pTestamentQ: '"old" o "new"',
    pVotdLanguageQ: 'Locale (en, pt-br, es, fr, de, it, zh, ru, ko). Predefinito: en.',
    pVotdVersionQ: 'Slug della versione. Predefinito: versione canonica del locale scelto.',
    passages: "Recupera fino a 50 riferimenti in una chiamata. Un riferimento non valido fallisce da solo, nella sua posizione.",
    parse: "Analizza un riferimento in testo libero (in una delle 9 lingue) e restituisce libro, capitolo e versetti",
    gTools: "Batch e parsing",
    pRefsQ: "Riferimenti separati da virgola (max 50)",
    pVersionQ: "Slug della versione",
    pQ: "Riferimento in testo libero, es. Giovanni 3:16-18",
    pParseVersionQ: "Opzionale. Viene validata e restituita",
    pPreviewQ: "Tronca il testo a circa N caratteri (da 40 a 2000), per i tooltip",
  },
  zh: {
    listVersions: "列出全部圣经版本（{versions} 个），含许可文本",
    versionDetail: '返回指定版本的元数据',
    listBooks: '列出圣经全部 66 卷书',
    bookDetail: '返回单卷书的元数据（支持任意语言的 slug）',
    chapter: '返回完整的圣经章节',
    verse: '返回单节或一段经文（16 或 16-20）',
    votd: "每日经文：同一 UTC 日期所有人获得同一节经文，附版本版权说明（缓存 24 小时）",
    gContent: '圣经内容',
    gReference: '版本与书卷',
    pVersionPath: '版本 slug（例：kjv、almeida-livre）',
    pBookPath: '任意语言的书卷 slug',
    pChapterPath: '章节序号',
    pVerseRangePath: '单节（16）或经文段（16-20）',
    pSlugPath: '任意语言的 slug',
    pLanguageQ: '按 ISO 语言代码过滤（完整列表见 /v1/versions）',
    pTestamentQ: '"old" 或 "new"',
    pVotdLanguageQ: '语言（en、pt-br、es、fr、de、it、zh、ru、ko），默认 en。',
    pVotdVersionQ: '版本 slug，默认使用所选语言的官方版本。',
    passages: "一次调用获取最多 50 处经文。无效引用只会在其所在位置单独报错。",
    parse: "将自由文本引用（9 种语言均可）解析为书卷、章和节",
    gTools: "批量与解析",
    pRefsQ: "以逗号分隔的引用（最多 50 个）",
    pVersionQ: "版本 slug",
    pQ: "自由文本引用，例如 约翰福音 3:16-18",
    pParseVersionQ: "可选。会被校验并在响应中返回",
    pPreviewQ: "将文本截断到约 N 个字符（40 到 2000），用于悬浮提示",
  },
  ru: {
    listVersions: "Список всех доступных переводов Библии ({versions}) с текстом лицензии",
    versionDetail: 'Возвращает метаданные конкретного перевода',
    listBooks: 'Список 66 книг Библии',
    bookDetail: 'Возвращает метаданные книги (slug на любом языке)',
    chapter: 'Возвращает полную главу Библии',
    verse: 'Возвращает один стих или диапазон (16 или 16-20)',
    votd: "Стих дня: один и тот же для всех в один UTC-день, со сведениями об авторских правах (кэш 24 ч)",
    gContent: 'Библейский текст',
    gReference: 'Переводы и книги',
    pVersionPath: 'Slug перевода (например, kjv, almeida-livre)',
    pBookPath: 'Slug книги на любом языке',
    pChapterPath: 'Номер главы',
    pVerseRangePath: 'Один стих (16) или диапазон (16-20)',
    pSlugPath: 'Slug на любом языке',
    pLanguageQ: 'Фильтр по коду языка ISO (полный список — /v1/versions)',
    pTestamentQ: '"old" или "new"',
    pVotdLanguageQ: 'Локаль (en, pt-br, es, fr, de, it, zh, ru, ko). По умолчанию: en.',
    pVotdVersionQ: 'Slug перевода. По умолчанию — канонический перевод выбранной локали.',
    passages: "До 50 ссылок за один вызов. Ошибочная ссылка не ломает весь запрос и возвращается на своей позиции.",
    parse: "Разбирает ссылку в свободной форме (на любом из 9 языков) на книгу, главу и стихи",
    gTools: "Пакетные запросы и разбор",
    pRefsQ: "Ссылки через запятую (не более 50)",
    pVersionQ: "Slug перевода",
    pQ: "Ссылка в свободной форме, например Иоанна 3:16-18",
    pParseVersionQ: "Необязательно. Проверяется и возвращается в ответе",
    pPreviewQ: "Обрезает текст примерно до N символов (от 40 до 2000), для всплывающих подсказок",
  },
  ko: {
    listVersions: "모든 성경 번역본을 나열합니다 ({versions}개, 라이선스 문구 포함)",
    versionDetail: '특정 번역본의 메타데이터를 반환합니다',
    listBooks: '성경 66권 목록을 반환합니다',
    bookDetail: '단일 책의 메타데이터 반환 (모든 언어의 slug 허용)',
    chapter: '전체 성경 장을 반환합니다',
    verse: '단일 절 또는 범위를 반환합니다 (16 또는 16-20)',
    votd: "오늘의 말씀: 같은 UTC 날짜에는 모두에게 같은 절, 번역본 저작권 문구 포함 (24시간 캐시)",
    gContent: '성경 본문',
    gReference: '번역본 및 책',
    pVersionPath: '번역본 slug (예: kjv, almeida-livre)',
    pBookPath: '모든 언어의 책 slug',
    pChapterPath: '장 번호',
    pVerseRangePath: '단일 절 (16) 또는 범위 (16-20)',
    pSlugPath: '모든 언어의 slug',
    pLanguageQ: 'ISO 언어 코드로 필터링 (전체 목록은 /v1/versions 참조)',
    pTestamentQ: '"old" 또는 "new"',
    pVotdLanguageQ: '로케일 (en, pt-br, es, fr, de, it, zh, ru, ko). 기본값: en.',
    pVotdVersionQ: '번역본 slug. 기본값: 선택한 로케일의 표준 번역본.',
    passages: "한 번의 호출로 최대 50개 구절을 가져옵니다. 잘못된 참조는 해당 위치에서만 오류로 표시됩니다.",
    parse: "자유 형식 참조(9개 언어 모두 지원)를 책, 장, 절로 분석합니다",
    gTools: "일괄 조회와 분석",
    pRefsQ: "쉼표로 구분한 참조 (최대 50개)",
    pVersionQ: "번역본 slug",
    pQ: "자유 형식 참조, 예: 요한복음 3:16-18",
    pParseVersionQ: "선택. 검증 후 응답에 그대로 반환",
    pPreviewQ: "본문을 약 N자(40~2000)로 자릅니다. 툴팁용",
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
          exampleCall: '/v1/kjv/john/3',
          params: [
            { name: 'version', type: 'path', required: true, description: t.pVersionPath },
            { name: 'book', type: 'path', required: true, description: t.pBookPath },
            { name: 'chapter', type: 'path', required: true, description: t.pChapterPath },
            { name: 'preview', type: 'query', description: t.pPreviewQ },
          ],
        },
        {
          method: 'GET',
          path: '/v1/{version}/{book}/{chapter}/{verse}',
          description: t.verse,
          exampleCall: '/v1/kjv/john/3/16',
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
      group: t.gTools,
      items: [
        {
          method: 'GET',
          path: '/v1/passages',
          description: t.passages,
          exampleCall: '/v1/passages?refs=john%203:16,psalms%2023:1&version=kjv',
          params: [
            { name: 'refs', type: 'query', required: true, description: t.pRefsQ },
            { name: 'version', type: 'query', required: true, description: t.pVersionQ },
          ],
        },
        {
          method: 'GET',
          path: '/v1/parse',
          description: t.parse,
          exampleCall: '/v1/parse?q=John%203:16-18',
          params: [
            { name: 'q', type: 'query', required: true, description: t.pQ },
            { name: 'version', type: 'query', description: t.pParseVersionQ },
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
          exampleCall: '/v1/versions/kjv',
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

const en: Translations = {
  htmlLang: "en",
  meta: {
    title: "Free Bible API: {versions} versions in {languages} languages | Midvash",
    description: "Free Bible REST API with no key and no rate limit. Verses, chapters and books from {versions} public domain and openly licensed versions in {languages} languages.",
  },
  nav: { skipToContent: "Skip to content" },
  hero: {
    eyebrow: "Free · No API key · No rate limit",
    title: "The Bible API",
    titleAccent: 'by Midvash',
    subtitle: "Verses, chapters and books from {versions} free Bible versions in {languages} languages. Plain JSON over HTTPS, callable straight from the browser. No signup, no key.",
    ctaPrimary: "Browse endpoints",
    ctaSecondary: "Quick start",
    ctaDocs: "OpenAPI reference",
  },
  features: {
    title: "Why developers use it",
    cards: [
      { title: "{versions} free versions", body: "KJV, BSB, WEB, Reina-Valera 1909, Louis Segond, Luther 1912 and many more, in {languages} languages. Every one is public domain or under a free license." },
      { title: "Credit included", body: "Each response with Bible text carries the version's copyright line, so attribution is one field away." },
      { title: "Fast at the edge", body: "Served from Cloudflare's edge with long-lived caching and ETags. Revalidations return an empty 304." },
      { title: "No key, no rate limit", body: "No signup, no API key, no 429s. Open CORS, so you can call it from any web page." },
    ],
  },
  quickStart: {
    title: "Get a verse in one call",
    subtitle: "Call the API directly. No setup, no auth.",
    runIt: "Try this call",
  },
  versions: {
    title: "Versions and licenses",
    subtitle: "{versions} versions in {languages} languages, all in the public domain or under a free license. Click a version to see its metadata and full license text.",
    creditTitle: "Show the credit next to the text",
    creditBody: "Every response that carries Bible text includes the version's credit: meta.copyright in v1, copyright in /v1/votd and in the legacy routes. Display it near the passage. CC BY and CC BY-SA licenses require it.",
    aliasTitle: "Asked for a version we no longer serve?",
    aliasBody: "Versions with all rights reserved (NIV, ESV, NLT, NVI, ARA, NVT, NTV and others) are not served. Old links keep working: you get a free version in the same language, and data.version tells you which one came back.",
    labelPublicDomain: "Public domain",
    labelTerms: "Free use, see terms",
    scopeFull: "OT + NT",
    scopeOt: "OT only",
    scopeNt: "NT only",
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
  more: {
    title: "More from Midvash",
    subtitle: "The same Bible data, ready for other places.",
    mcpTitle: "Bible MCP",
    mcpBody: "Connect Claude, Cursor and other MCP-capable AI assistants to the Bible.",
    wpTitle: "WordPress plugin",
    wpBody: "Turn Bible references on your site into verse tooltips, powered by this API.",
    appTitle: "Midvash: Bible & Devotional",
    appBody: "A daily devotional with Bible study depth, on the web, iOS and Android.",
    cta: "Learn more",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      { q: "Is it really free? Do I need an API key?", a: "Yes. No signup, no key and no rate limit. Please honor ETags (If-None-Match returns 304) and batch references with /v1/passages instead of one request per verse." },
      { q: "Which Bible versions are available?", a: "{versions} versions in {languages} languages, all in the public domain or under a free license such as CC BY or CC BY-SA. The live list is at /v1/versions." },
      { q: "Why can't I get NIV or ESV?", a: "Their publishers reserve all rights, so we don't redistribute them. A request for one of them returns a free version in the same language, and data.version says which one." },
      { q: "What do I have to show in my app?", a: "The version's credit, from meta.copyright (or copyright in /v1/votd and the legacy routes), next to the text. Some licenses add conditions, such as share-alike (CC BY-SA) or no changes to the text (CC BY-ND), so read the full text for the version you pick." },
      { q: "Is there an OpenAPI spec?", a: "Yes: /openapi.json (OpenAPI 3.1) and an interactive reference at /docs. For AI agents, use the Bible MCP at mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Developed by",
    tagline: "Open source · Free forever · No signup",
    ecosystemLabel: "Midvash ecosystem",
    productsLabel: "Products",
    openSourceLabel: "Open source",
    allReposLabel: "All repositories",
    ecosystem: {
      reader: "Bible & Devotional",
      api: "Bible API",
      mcp: "Bible MCP",
      wordpress: "WordPress plugin",
      chrome: "Chrome extension",
      ios: "iOS app",
      android: "Android app",
    },
    socialLabel: "Follow us",
    instagramLabel: "Visit our Instagram",
    copyright: "© 2025-{year} Midvash. All rights reserved.",
  },
};

const es: Translations = {
  htmlLang: "es",
  meta: {
    title: "API de la Biblia gratis: {versions} versiones en {languages} idiomas | Midvash",
    description: "API REST de la Biblia gratis, sin clave y sin límite de peticiones. Versículos, capítulos y libros de {versions} versiones libres en {languages} idiomas.",
  },
  nav: { skipToContent: "Saltar al contenido" },
  hero: {
    eyebrow: "Gratis · Sin clave de API · Sin límite",
    title: "La API de la Biblia",
    titleAccent: 'by Midvash',
    subtitle: "Versículos, capítulos y libros de {versions} versiones libres de la Biblia en {languages} idiomas. JSON por HTTPS, directo desde el navegador. Sin registro, sin clave.",
    ctaPrimary: "Ver endpoints",
    ctaSecondary: "Comienzo rápido",
    ctaDocs: "Referencia OpenAPI",
  },
  features: {
    title: "Por qué usarla",
    cards: [
      { title: "{versions} versiones libres", body: "Reina-Valera 1909, KJV, BSB, Louis Segond y muchas más, en {languages} idiomas. Todas de dominio público o con licencia libre." },
      { title: "Crédito incluido", body: "Cada respuesta con texto bíblico trae la línea de copyright de la versión. La atribución está a un campo de distancia." },
      { title: "Rápida en el edge", body: "Servida desde el edge de Cloudflare con caché larga y ETag. La revalidación devuelve un 304 sin cuerpo." },
      { title: "Sin clave, sin límite", body: "Sin registro, sin clave de API, sin 429. CORS abierto: llámala desde cualquier página web." },
    ],
  },
  quickStart: {
    title: "Obtén un versículo en una llamada",
    subtitle: "Llama a la API directamente. Sin configuración, sin autenticación.",
    runIt: "Probar esta llamada",
  },
  versions: {
    title: "Versiones y licencias",
    subtitle: "{versions} versiones en {languages} idiomas, todas de dominio público o con licencia libre. Haz clic en una versión para ver sus metadatos y el texto completo de la licencia.",
    creditTitle: "Muestra el crédito junto al texto",
    creditBody: "Cada respuesta con texto bíblico incluye el crédito de la versión: meta.copyright en v1, copyright en /v1/votd y en las rutas heredadas. Muéstralo cerca del pasaje. Las licencias CC BY y CC BY-SA lo exigen.",
    aliasTitle: "¿Pediste una versión que ya no servimos?",
    aliasBody: "Las versiones con todos los derechos reservados (NVI, NTV, NIV, ESV, NLT, ARA, NVT y otras) no se sirven. Los enlaces antiguos siguen funcionando: recibes una versión libre del mismo idioma, y data.version indica cuál llegó.",
    labelPublicDomain: "Dominio público",
    labelTerms: "Uso libre, ver términos",
    scopeFull: "AT + NT",
    scopeOt: "Solo AT",
    scopeNt: "Solo NT",
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
  more: {
    title: "Más de Midvash",
    subtitle: "Los mismos datos bíblicos, listos para otros lugares.",
    mcpTitle: "MCP de la Biblia",
    mcpBody: "Conecta Claude, Cursor y otros asistentes de IA compatibles con MCP a la Biblia.",
    wpTitle: "Plugin para WordPress",
    wpBody: "Convierte las referencias bíblicas de tu sitio en tooltips con el versículo, usando esta API.",
    appTitle: "Midvash: Biblia y Devocional",
    appBody: "Devocional diario con la profundidad de un estudio bíblico, en la web, iOS y Android.",
    cta: "Más información",
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      { q: "¿Es realmente gratis? ¿Necesito una clave de API?", a: "Sí. Sin registro, sin clave y sin límite de peticiones. Solo te pedimos respetar el ETag (If-None-Match devuelve 304) y agrupar referencias con /v1/passages en lugar de una petición por versículo." },
      { q: "¿Qué versiones hay disponibles?", a: "{versions} versiones en {languages} idiomas, todas de dominio público o con licencia libre, como CC BY o CC BY-SA. La lista en vivo está en /v1/versions." },
      { q: "¿Por qué no está la NVI ni la NTV?", a: "Sus editoriales se reservan todos los derechos, así que no las redistribuimos. Quien pide una de ellas recibe una versión libre del mismo idioma, y data.version indica cuál." },
      { q: "¿Qué tengo que mostrar en mi app?", a: "El crédito de la versión, que viene en meta.copyright (o copyright en /v1/votd y en las rutas heredadas), junto al texto. Algunas licencias añaden condiciones, como compartir con la misma licencia (CC BY-SA) o no modificar el texto (CC BY-ND). Lee el texto completo de la versión que elijas." },
      { q: "¿Hay especificación OpenAPI?", a: "Sí: /openapi.json (OpenAPI 3.1) y una referencia interactiva en /docs. Para agentes de IA, usa el MCP de la Biblia en mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Desarrollado por",
    tagline: "Código abierto · Gratis para siempre · Sin registro",
    ecosystemLabel: "Ecosistema Midvash",
    productsLabel: "Productos",
    openSourceLabel: "Código abierto",
    allReposLabel: "Todos los repositorios",
    ecosystem: {
      reader: "Biblia y Devocional",
      api: "API de la Biblia",
      mcp: "MCP de la Biblia",
      wordpress: "Plugin para WordPress",
      chrome: "Extensión para Chrome",
      ios: "App iOS",
      android: "App Android",
    },
    socialLabel: "Síguenos",
    instagramLabel: "Visita nuestro Instagram",
    copyright: "© 2025-{year} Midvash. Todos los derechos reservados.",
  },
};

const ptBr: Translations = {
  htmlLang: "pt-BR",
  meta: {
    title: "API da Bíblia grátis: {versions} versões em {languages} idiomas | Midvash",
    description: "API REST da Bíblia grátis, sem chave e sem limite de requisições. Versículos, capítulos e livros de {versions} versões livres em {languages} idiomas.",
  },
  nav: { skipToContent: "Pular para o conteúdo" },
  hero: {
    eyebrow: "Grátis · Sem chave de API · Sem limite",
    title: "A API da Bíblia",
    titleAccent: 'by Midvash',
    subtitle: "Versículos, capítulos e livros de {versions} versões livres da Bíblia em {languages} idiomas. JSON puro via HTTPS, direto do navegador. Sem cadastro, sem chave.",
    ctaPrimary: "Ver endpoints",
    ctaSecondary: "Início rápido",
    ctaDocs: "Referência OpenAPI",
  },
  features: {
    title: "Por que usar",
    cards: [
      { title: "{versions} versões livres", body: "Bíblia Livre (Almeida 1819), Open Nova Bíblia Viva, NVA, KJV, BSB e muitas outras, em {languages} idiomas. Todas em domínio público ou com licença livre." },
      { title: "Crédito incluído", body: "Toda resposta com texto bíblico traz a linha de copyright da versão. A atribuição está a um campo de distância." },
      { title: "Rápida no edge", body: "Servida pelo edge da Cloudflare com cache longo e ETag. A revalidação devolve 304 sem corpo." },
      { title: "Sem chave, sem limite", body: "Sem cadastro, sem chave de API, sem 429. CORS aberto: chame de qualquer página web." },
    ],
  },
  quickStart: {
    title: "Pegue um versículo em uma chamada",
    subtitle: "Chame a API direto. Sem setup, sem autenticação.",
    runIt: "Testar esta chamada",
  },
  versions: {
    title: "Versões e licenças",
    subtitle: "{versions} versões em {languages} idiomas, todas em domínio público ou com licença livre. Clique numa versão para ver os metadados e o texto completo da licença.",
    creditTitle: "Mostre o crédito junto do texto",
    creditBody: "Toda resposta com texto bíblico traz o crédito da versão: meta.copyright na v1, copyright no /v1/votd e nas rotas legadas. Exiba perto da passagem. As licenças CC BY e CC BY-SA exigem.",
    aliasTitle: "Pediu uma versão que saiu?",
    aliasBody: "Versões com todos os direitos reservados (NVI, ARA, NVT, NIV, ESV, NLT, NTV e outras) não são servidas. Links antigos continuam funcionando: você recebe uma versão livre do mesmo idioma, e data.version diz qual veio.",
    labelPublicDomain: "Domínio público",
    labelTerms: "Uso livre, ver termos",
    scopeFull: "AT + NT",
    scopeOt: "Só AT",
    scopeNt: "Só NT",
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
  more: {
    title: "Mais do Midvash",
    subtitle: "Os mesmos dados bíblicos, prontos para outros lugares.",
    mcpTitle: "MCP da Bíblia",
    mcpBody: "Conecte o Claude, o Cursor e outros assistentes de IA compatíveis com MCP à Bíblia.",
    wpTitle: "Plugin para WordPress",
    wpBody: "Transforme as referências bíblicas do seu site em tooltips com o versículo, usando esta API.",
    appTitle: "Midvash: Bíblia & Devocional",
    appBody: "Devocional diário com profundidade de estudo bíblico, na web, no iOS e no Android.",
    cta: "Saiba mais",
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      { q: "É grátis mesmo? Preciso de chave de API?", a: "Sim. Sem cadastro, sem chave e sem limite de requisições. Só pedimos que você respeite o ETag (If-None-Match devolve 304) e agrupe referências no /v1/passages em vez de fazer uma requisição por versículo." },
      { q: "Quais versões estão disponíveis?", a: "{versions} versões em {languages} idiomas, todas em domínio público ou com licença livre, como CC BY ou CC BY-SA. A lista ao vivo fica em /v1/versions." },
      { q: "Por que não tem NVI, ARA ou NVT?", a: "As editoras reservam todos os direitos, então não redistribuímos. Quem pede uma delas recebe uma versão livre do mesmo idioma, e data.version informa qual." },
      { q: "O que preciso mostrar no meu app?", a: "O crédito da versão, que vem em meta.copyright (ou copyright no /v1/votd e nas rotas legadas), junto do texto. Algumas licenças têm condições extras, como compartilhar pela mesma licença (CC BY-SA) ou não alterar o texto (CC BY-ND). Leia o texto completo da versão que escolher." },
      { q: "Tem especificação OpenAPI?", a: "Tem: /openapi.json (OpenAPI 3.1) e uma referência interativa em /docs. Para agentes de IA, use o MCP da Bíblia em mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Desenvolvido por",
    tagline: "Código aberto · Grátis para sempre · Sem cadastro",
    ecosystemLabel: "Ecossistema Midvash",
    productsLabel: "Produtos",
    openSourceLabel: "Código aberto",
    allReposLabel: "Todos os repositórios",
    ecosystem: {
      reader: "Bíblia & Devocional",
      api: "API da Bíblia",
      mcp: "MCP da Bíblia",
      wordpress: "Plugin para WordPress",
      chrome: "Extensão para Chrome",
      ios: "App iOS",
      android: "App Android",
    },
    socialLabel: "Siga a gente",
    instagramLabel: "Visite nosso Instagram",
    copyright: "© 2025-{year} Midvash. Todos os direitos reservados.",
  },
};

const fr: Translations = {
  htmlLang: "fr",
  meta: {
    title: "API Bible gratuite : {versions} versions en {languages} langues | Midvash",
    description: "API REST de la Bible gratuite, sans clé et sans limite de requêtes. Versets, chapitres et livres de {versions} versions libres en {languages} langues.",
  },
  nav: { skipToContent: "Aller au contenu" },
  hero: {
    eyebrow: "Gratuite · Sans clé d'API · Sans limite",
    title: "L'API de la Bible",
    titleAccent: 'by Midvash',
    subtitle: "Versets, chapitres et livres de {versions} versions libres de la Bible en {languages} langues. Du JSON en HTTPS, appelable depuis le navigateur. Sans inscription, sans clé.",
    ctaPrimary: "Voir les endpoints",
    ctaSecondary: "Démarrage rapide",
    ctaDocs: "Référence OpenAPI",
  },
  features: {
    title: "Pourquoi l'utiliser",
    cards: [
      { title: "{versions} versions libres", body: "Louis Segond 1910, Darby, Crampon, Martin 1744, KJV, BSB et bien d'autres, en {languages} langues. Toutes dans le domaine public ou sous licence libre." },
      { title: "Crédit inclus", body: "Chaque réponse contenant du texte biblique fournit la mention de copyright de la version. L'attribution est à portée d'un champ." },
      { title: "Rapide à l'edge", body: "Servie depuis l'edge de Cloudflare avec un cache longue durée et des ETag. Une revalidation renvoie un 304 sans corps." },
      { title: "Sans clé, sans limite", body: "Pas d'inscription, pas de clé d'API, pas de 429. CORS ouvert : appelez-la depuis n'importe quelle page web." },
    ],
  },
  quickStart: {
    title: "Obtenez un verset en un appel",
    subtitle: "Appelez l'API directement. Sans configuration, sans authentification.",
    runIt: "Tester cet appel",
  },
  versions: {
    title: "Versions et licences",
    subtitle: "{versions} versions en {languages} langues, toutes dans le domaine public ou sous licence libre. Cliquez sur une version pour voir ses métadonnées et le texte complet de sa licence.",
    creditTitle: "Affichez le crédit à côté du texte",
    creditBody: "Chaque réponse contenant du texte biblique inclut le crédit de la version : meta.copyright en v1, copyright dans /v1/votd et les routes historiques. Affichez-le près du passage. Les licences CC BY et CC BY-SA l'exigent.",
    aliasTitle: "Vous demandez une version que nous ne servons plus ?",
    aliasBody: "Les versions dont tous les droits sont réservés (NIV, ESV, NLT, NVI, ARA, NVT, NTV et autres) ne sont pas servies. Les anciens liens fonctionnent toujours : vous recevez une version libre de la même langue, et data.version indique laquelle.",
    labelPublicDomain: "Domaine public",
    labelTerms: "Usage libre, voir conditions",
    scopeFull: "AT + NT",
    scopeOt: "AT seul",
    scopeNt: "NT seul",
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
  more: {
    title: "Aussi chez Midvash",
    subtitle: "Les mêmes données bibliques, prêtes pour d'autres usages.",
    mcpTitle: "MCP de la Bible",
    mcpBody: "Connectez Claude, Cursor et d'autres assistants IA compatibles MCP à la Bible.",
    wpTitle: "Plugin WordPress",
    wpBody: "Transformez les références bibliques de votre site en infobulles avec le verset, grâce à cette API.",
    appTitle: "Midvash : Bible et méditation",
    appBody: "Une méditation quotidienne avec la profondeur d'une étude biblique, sur le web, iOS et Android.",
    cta: "En savoir plus",
  },
  faq: {
    title: "Questions fréquentes",
    items: [
      { q: "Est-ce vraiment gratuit ? Faut-il une clé d'API ?", a: "Oui. Pas d'inscription, pas de clé, pas de limite de requêtes. Merci simplement de respecter les ETag (If-None-Match renvoie 304) et de regrouper les références avec /v1/passages plutôt qu'une requête par verset." },
      { q: "Quelles versions sont disponibles ?", a: "{versions} versions en {languages} langues, toutes dans le domaine public ou sous licence libre, comme CC BY ou CC BY-SA. La liste à jour est sur /v1/versions." },
      { q: "Pourquoi pas la NIV ni l'ESV ?", a: "Leurs éditeurs réservent tous les droits, nous ne les redistribuons donc pas. Une requête pour l'une d'elles renvoie une version libre de la même langue, et data.version indique laquelle." },
      { q: "Que dois-je afficher dans mon app ?", a: "Le crédit de la version, fourni dans meta.copyright (ou copyright dans /v1/votd et les routes historiques), à côté du texte. Certaines licences ajoutent des conditions, comme le partage dans les mêmes conditions (CC BY-SA) ou l'interdiction de modifier le texte (CC BY-ND). Lisez le texte complet de la version choisie." },
      { q: "Existe-t-il une spécification OpenAPI ?", a: "Oui : /openapi.json (OpenAPI 3.1) et une référence interactive sur /docs. Pour les agents IA, utilisez le MCP de la Bible sur mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Développé par",
    tagline: "Open source · Gratuite à vie · Sans inscription",
    ecosystemLabel: "Écosystème Midvash",
    productsLabel: "Produits",
    openSourceLabel: "Open source",
    allReposLabel: "Tous les dépôts",
    ecosystem: {
      reader: "Bible et méditation",
      api: "API de la Bible",
      mcp: "MCP de la Bible",
      wordpress: "Plugin WordPress",
      chrome: "Extension Chrome",
      ios: "App iOS",
      android: "App Android",
    },
    socialLabel: "Suivez-nous",
    instagramLabel: "Visitez notre Instagram",
    copyright: "© 2025-{year} Midvash. Tous droits réservés.",
  },
};

const de: Translations = {
  htmlLang: "de",
  meta: {
    title: "Kostenlose Bibel-API: {versions} Übersetzungen, {languages} Sprachen | Midvash",
    description: "Kostenlose Bibel-REST-API ohne Key und ohne Rate-Limit. Verse, Kapitel und Bücher aus {versions} freien Übersetzungen in {languages} Sprachen.",
  },
  nav: { skipToContent: "Zum Inhalt springen" },
  hero: {
    eyebrow: "Kostenlos · Ohne API-Key · Ohne Limit",
    title: "Die Bibel-API",
    titleAccent: 'by Midvash',
    subtitle: "Verse, Kapitel und Bücher aus {versions} freien Bibelübersetzungen in {languages} Sprachen. JSON über HTTPS, direkt aus dem Browser abrufbar. Ohne Anmeldung, ohne Key.",
    ctaPrimary: "Endpoints ansehen",
    ctaSecondary: "Schnellstart",
    ctaDocs: "OpenAPI-Referenz",
  },
  features: {
    title: "Warum diese API",
    cards: [
      { title: "{versions} freie Übersetzungen", body: "Luther 1912, Schlachter 1951, Elberfelder 1905, Menge 1939, KJV, BSB und viele mehr, in {languages} Sprachen. Alle gemeinfrei oder unter freier Lizenz." },
      { title: "Quellenangabe inklusive", body: "Jede Antwort mit Bibeltext enthält den Copyright-Vermerk der Übersetzung. Die Quellenangabe ist nur ein Feld entfernt." },
      { title: "Schnell am Edge", body: "Ausgeliefert vom Cloudflare-Edge mit langem Caching und ETags. Eine Revalidierung liefert ein leeres 304." },
      { title: "Ohne Key, ohne Limit", body: "Keine Anmeldung, kein API-Key, keine 429-Fehler. Offenes CORS: direkt von jeder Webseite aufrufbar." },
    ],
  },
  quickStart: {
    title: "Ein Vers mit einem Aufruf",
    subtitle: "Rufen Sie die API direkt auf. Ohne Setup, ohne Authentifizierung.",
    runIt: "Diesen Aufruf testen",
  },
  versions: {
    title: "Übersetzungen und Lizenzen",
    subtitle: "{versions} Übersetzungen in {languages} Sprachen, alle gemeinfrei oder unter freier Lizenz. Klicken Sie auf eine Übersetzung, um Metadaten und den vollständigen Lizenztext zu sehen.",
    creditTitle: "Quellenangabe neben dem Text zeigen",
    creditBody: "Jede Antwort mit Bibeltext enthält die Quellenangabe der Übersetzung: meta.copyright in v1, copyright in /v1/votd und in den Legacy-Routen. Zeigen Sie sie in der Nähe der Bibelstelle an. CC BY und CC BY-SA verlangen das.",
    aliasTitle: "Eine Übersetzung angefragt, die wir nicht mehr ausliefern?",
    aliasBody: "Übersetzungen, bei denen alle Rechte vorbehalten sind (NIV, ESV, NLT, NVI, ARA, NVT, NTV und andere), werden nicht ausgeliefert. Alte Links funktionieren weiter: Sie erhalten eine freie Übersetzung derselben Sprache, und data.version zeigt, welche.",
    labelPublicDomain: "Gemeinfrei",
    labelTerms: "Freie Nutzung, siehe Bedingungen",
    scopeFull: "AT + NT",
    scopeOt: "Nur AT",
    scopeNt: "Nur NT",
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
  more: {
    title: "Mehr von Midvash",
    subtitle: "Dieselben Bibeldaten, bereit für andere Orte.",
    mcpTitle: "Bibel-MCP",
    mcpBody: "Verbinden Sie Claude, Cursor und andere MCP-fähige KI-Assistenten mit der Bibel.",
    wpTitle: "WordPress-Plugin",
    wpBody: "Macht Bibelstellen auf Ihrer Website zu Tooltips mit dem Verstext, auf Basis dieser API.",
    appTitle: "Midvash: Bibel und Andacht",
    appBody: "Tägliche Andacht mit der Tiefe eines Bibelstudiums, im Web, auf iOS und Android.",
    cta: "Mehr erfahren",
  },
  faq: {
    title: "Häufige Fragen",
    items: [
      { q: "Ist das wirklich kostenlos? Brauche ich einen API-Key?", a: "Ja. Keine Anmeldung, kein Key und kein Rate-Limit. Bitte beachten Sie ETags (If-None-Match liefert 304) und bündeln Sie Stellen mit /v1/passages statt einer Anfrage pro Vers." },
      { q: "Welche Übersetzungen gibt es?", a: "{versions} Übersetzungen in {languages} Sprachen, alle gemeinfrei oder unter freier Lizenz wie CC BY oder CC BY-SA. Die aktuelle Liste steht unter /v1/versions." },
      { q: "Warum gibt es keine NIV oder ESV?", a: "Ihre Verlage behalten sich alle Rechte vor, daher verbreiten wir sie nicht weiter. Wer eine davon anfragt, erhält eine freie Übersetzung derselben Sprache, und data.version sagt, welche." },
      { q: "Was muss ich in meiner App anzeigen?", a: "Die Quellenangabe der Übersetzung aus meta.copyright (oder copyright in /v1/votd und den Legacy-Routen), neben dem Text. Manche Lizenzen haben weitere Bedingungen, etwa Weitergabe unter gleichen Bedingungen (CC BY-SA) oder keine Änderungen am Text (CC BY-ND). Lesen Sie den vollständigen Text der gewählten Übersetzung." },
      { q: "Gibt es eine OpenAPI-Spezifikation?", a: "Ja: /openapi.json (OpenAPI 3.1) und eine interaktive Referenz unter /docs. Für KI-Agenten gibt es das Bibel-MCP unter mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Entwickelt von",
    tagline: "Open Source · Für immer kostenlos · Keine Anmeldung",
    ecosystemLabel: "Midvash-Ökosystem",
    productsLabel: "Produkte",
    openSourceLabel: "Open Source",
    allReposLabel: "Alle Repositories",
    ecosystem: {
      reader: "Bibel und Andacht",
      api: "Bibel-API",
      mcp: "Bibel-MCP",
      wordpress: "WordPress-Plugin",
      chrome: "Chrome-Erweiterung",
      ios: "iOS-App",
      android: "Android-App",
    },
    socialLabel: "Folgen Sie uns",
    instagramLabel: "Besuchen Sie unser Instagram",
    copyright: "© 2025-{year} Midvash. Alle Rechte vorbehalten.",
  },
};

const it: Translations = {
  htmlLang: "it",
  meta: {
    title: "API della Bibbia gratuita: {versions} versioni in {languages} lingue | Midvash",
    description: "API REST della Bibbia gratuita, senza chiave e senza limiti di richieste. Versetti, capitoli e libri da {versions} versioni libere in {languages} lingue.",
  },
  nav: { skipToContent: "Vai al contenuto" },
  hero: {
    eyebrow: "Gratuita · Senza chiave API · Senza limiti",
    title: "L'API della Bibbia",
    titleAccent: 'by Midvash',
    subtitle: "Versetti, capitoli e libri da {versions} versioni libere della Bibbia in {languages} lingue. JSON via HTTPS, richiamabile direttamente dal browser. Senza registrazione, senza chiave.",
    ctaPrimary: "Vedi gli endpoint",
    ctaSecondary: "Avvio rapido",
    ctaDocs: "Riferimento OpenAPI",
  },
  features: {
    title: "Perché usarla",
    cards: [
      { title: "{versions} versioni libere", body: "Riveduta 1927, Diodati 1649, KJV, BSB, Louis Segond e molte altre, in {languages} lingue. Tutte di pubblico dominio o con licenza libera." },
      { title: "Attribuzione inclusa", body: "Ogni risposta con testo biblico riporta la nota di copyright della versione. L'attribuzione è a un campo di distanza." },
      { title: "Veloce sull'edge", body: "Servita dall'edge di Cloudflare con cache a lunga durata ed ETag. Una rivalidazione restituisce un 304 senza corpo." },
      { title: "Senza chiave, senza limiti", body: "Niente registrazione, niente chiave API, niente 429. CORS aperto: chiamala da qualsiasi pagina web." },
    ],
  },
  quickStart: {
    title: "Ottieni un versetto con una chiamata",
    subtitle: "Chiama l'API direttamente. Senza setup, senza autenticazione.",
    runIt: "Prova questa chiamata",
  },
  versions: {
    title: "Versioni e licenze",
    subtitle: "{versions} versioni in {languages} lingue, tutte di pubblico dominio o con licenza libera. Clicca su una versione per vederne i metadati e il testo completo della licenza.",
    creditTitle: "Mostra l'attribuzione accanto al testo",
    creditBody: "Ogni risposta con testo biblico include l'attribuzione della versione: meta.copyright nella v1, copyright in /v1/votd e nelle rotte legacy. Mostrala vicino al passo. Le licenze CC BY e CC BY-SA lo richiedono.",
    aliasTitle: "Hai chiesto una versione che non serviamo più?",
    aliasBody: "Le versioni con tutti i diritti riservati (NIV, ESV, NLT, NVI, ARA, NVT, NTV e altre) non sono servite. I vecchi link continuano a funzionare: ricevi una versione libera nella stessa lingua, e data.version indica quale.",
    labelPublicDomain: "Pubblico dominio",
    labelTerms: "Uso libero, vedi condizioni",
    scopeFull: "AT + NT",
    scopeOt: "Solo AT",
    scopeNt: "Solo NT",
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
  more: {
    title: "Altro da Midvash",
    subtitle: "Gli stessi dati biblici, pronti per altri contesti.",
    mcpTitle: "MCP della Bibbia",
    mcpBody: "Collega Claude, Cursor e altri assistenti IA compatibili con MCP alla Bibbia.",
    wpTitle: "Plugin WordPress",
    wpBody: "Trasforma i riferimenti biblici del tuo sito in tooltip con il versetto, grazie a questa API.",
    appTitle: "Midvash: Bibbia e Devozionale",
    appBody: "Un devozionale quotidiano con la profondità di uno studio biblico, sul web, su iOS e Android.",
    cta: "Scopri di più",
  },
  faq: {
    title: "Domande frequenti",
    items: [
      { q: "È davvero gratuita? Serve una chiave API?", a: "Sì. Niente registrazione, niente chiave e nessun limite di richieste. Ti chiediamo solo di rispettare gli ETag (If-None-Match restituisce 304) e di raggruppare i riferimenti con /v1/passages invece di una richiesta per versetto." },
      { q: "Quali versioni sono disponibili?", a: "{versions} versioni in {languages} lingue, tutte di pubblico dominio o con licenza libera, come CC BY o CC BY-SA. L'elenco aggiornato è su /v1/versions." },
      { q: "Perché non ci sono la NIV o l'ESV?", a: "I loro editori si riservano tutti i diritti, quindi non le ridistribuiamo. Chi ne richiede una riceve una versione libera nella stessa lingua, e data.version indica quale." },
      { q: "Cosa devo mostrare nella mia app?", a: "L'attribuzione della versione, che arriva in meta.copyright (o copyright in /v1/votd e nelle rotte legacy), accanto al testo. Alcune licenze aggiungono condizioni, come la condivisione allo stesso modo (CC BY-SA) o il divieto di modificare il testo (CC BY-ND). Leggi il testo completo della versione scelta." },
      { q: "Esiste una specifica OpenAPI?", a: "Sì: /openapi.json (OpenAPI 3.1) e un riferimento interattivo su /docs. Per gli agenti IA, usa l'MCP della Bibbia su mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Sviluppato da",
    tagline: "Open source · Gratuita per sempre · Senza registrazione",
    ecosystemLabel: "Ecosistema Midvash",
    productsLabel: "Prodotti",
    openSourceLabel: "Open source",
    allReposLabel: "Tutti i repository",
    ecosystem: {
      reader: "Bibbia e Devozionale",
      api: "API della Bibbia",
      mcp: "MCP della Bibbia",
      wordpress: "Plugin WordPress",
      chrome: "Estensione Chrome",
      ios: "App iOS",
      android: "App Android",
    },
    socialLabel: "Seguici",
    instagramLabel: "Visita il nostro Instagram",
    copyright: "© 2025-{year} Midvash. Tutti i diritti riservati.",
  },
};

const zh: Translations = {
  htmlLang: "zh-Hans",
  meta: {
    title: "免费圣经 API：{languages} 种语言、{versions} 个版本 | Midvash",
    description: "免费的圣经 REST API，无需密钥，不限请求次数。提供 {languages} 种语言、{versions} 个公有领域或开放许可版本的经文、章节和书卷数据。",
  },
  nav: { skipToContent: "跳到主要内容" },
  hero: {
    eyebrow: "免费 · 无需 API 密钥 · 不限次数",
    title: "圣经 API",
    titleAccent: 'by Midvash',
    subtitle: "{languages} 种语言、{versions} 个可自由使用的圣经版本，提供经文、章节和书卷。通过 HTTPS 返回 JSON，浏览器可直接调用。无需注册，无需密钥。",
    ctaPrimary: "查看接口",
    ctaSecondary: "快速开始",
    ctaDocs: "OpenAPI 参考",
  },
  features: {
    title: "为什么选择它",
    cards: [
      { title: "{versions} 个自由版本", body: "和合本（简体与繁体）、KJV、BSB、Louis Segond、Luther 1912 等，覆盖 {languages} 种语言。全部为公有领域或开放许可。" },
      { title: "自带版权说明", body: "每个包含经文的响应都附带该版本的版权说明，标注出处只需读取一个字段。" },
      { title: "边缘加速", body: "由 Cloudflare 边缘节点提供，长期缓存并带 ETag。重新验证时返回空的 304。" },
      { title: "无密钥，不限次数", body: "无需注册，无需 API 密钥，不会返回 429。CORS 全开放，任何网页都能直接调用。" },
    ],
  },
  quickStart: {
    title: "一次调用获取一节经文",
    subtitle: "直接调用 API，无需配置，无需认证。",
    runIt: "试一下",
  },
  versions: {
    title: "版本与许可",
    subtitle: "{languages} 种语言共 {versions} 个版本，全部为公有领域或开放许可。点击任意版本查看元数据和完整许可文本。",
    creditTitle: "在经文旁显示版权说明",
    creditBody: "每个包含经文的响应都带有该版本的版权说明：v1 中为 meta.copyright，/v1/votd 和旧版路由中为 copyright。请在经文附近显示。CC BY 和 CC BY-SA 许可要求这样做。",
    aliasTitle: "请求的版本已不再提供？",
    aliasBody: "保留全部权利的版本（NIV、ESV、NLT、NVI、ARA、NVT、NTV 等）不再提供。旧链接仍然可用：会返回同一语言的自由版本，data.version 会告诉你实际返回的是哪一个。",
    labelPublicDomain: "公有领域",
    labelTerms: "可自由使用，见条款",
    scopeFull: "旧约 + 新约",
    scopeOt: "仅旧约",
    scopeNt: "仅新约",
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
  more: {
    title: "Midvash 的其他产品",
    subtitle: "同样的圣经数据，用在更多地方。",
    mcpTitle: "圣经 MCP",
    mcpBody: "通过 MCP 协议，把 Claude、Cursor 等 AI 助手连接到圣经。",
    wpTitle: "WordPress 插件",
    wpBody: "借助本 API，把网站上的经文引用变成显示经文内容的悬浮提示。",
    appTitle: "Midvash：圣经与灵修",
    appBody: "具备研经深度的每日灵修，支持网页、iOS 和 Android。",
    cta: "了解更多",
  },
  faq: {
    title: "常见问题",
    items: [
      { q: "真的免费吗？需要 API 密钥吗？", a: "是的。无需注册，无需密钥，也不限请求次数。只请你遵循 ETag（If-None-Match 会返回 304），并用 /v1/passages 批量获取引用，而不是每节经文发一次请求。" },
      { q: "有哪些版本？", a: "{languages} 种语言共 {versions} 个版本，全部为公有领域或采用 CC BY、CC BY-SA 等开放许可。实时列表见 /v1/versions。" },
      { q: "为什么没有 NIV 或 ESV？", a: "这些版本的出版方保留全部权利，因此我们不转发它们。请求其中某个版本时，会返回同一语言的自由版本，data.version 会标明是哪一个。" },
      { q: "我的应用需要显示什么？", a: "在经文旁显示该版本的版权说明，来自 meta.copyright（/v1/votd 和旧版路由中为 copyright）。部分许可还有附加条件，例如以相同方式共享（CC BY-SA）或禁止修改文本（CC BY-ND）。请阅读所选版本的完整许可文本。" },
      { q: "有 OpenAPI 规范吗？", a: "有：/openapi.json（OpenAPI 3.1），以及位于 /docs 的交互式参考。AI 智能体可以使用 mcp.midvash.com 上的圣经 MCP。" },
    ],
  },
  footer: {
    builtBy: "开发者",
    tagline: "开源 · 永久免费 · 无需注册",
    ecosystemLabel: "Midvash 生态",
    productsLabel: "产品",
    openSourceLabel: "开源",
    allReposLabel: "全部仓库",
    ecosystem: {
      reader: "圣经与灵修",
      api: "圣经 API",
      mcp: "圣经 MCP",
      wordpress: "WordPress 插件",
      chrome: "Chrome 扩展",
      ios: "iOS 应用",
      android: "Android 应用",
    },
    socialLabel: "关注我们",
    instagramLabel: "访问我们的 Instagram",
    copyright: "© 2025-{year} Midvash 保留所有权利。",
  },
};

const ru: Translations = {
  htmlLang: "ru",
  meta: {
    title: "Бесплатный API Библии без ключа и лимитов | Midvash",
    description: "Бесплатный REST API Библии без ключа и лимита запросов. Стихи, главы и книги из свободных переводов Библии. Переводов: {versions}, языков: {languages}.",
  },
  nav: { skipToContent: "Перейти к содержанию" },
  hero: {
    eyebrow: "Бесплатно · Без API-ключа · Без лимитов",
    title: "API Библии",
    titleAccent: 'by Midvash',
    subtitle: "Стихи, главы и книги из свободных переводов Библии (переводов: {versions}, языков: {languages}). JSON по HTTPS, можно вызывать прямо из браузера. Без регистрации и без ключа.",
    ctaPrimary: "Смотреть эндпоинты",
    ctaSecondary: "Быстрый старт",
    ctaDocs: "Справка OpenAPI",
  },
  features: {
    title: "Почему стоит использовать",
    cards: [
      { title: "Свободные переводы: {versions}", body: "Синодальный перевод, KJV, BSB, Лютер 1912, Louis Segond и многие другие. Языков: {languages}. Все в общественном достоянии или под свободной лицензией." },
      { title: "Атрибуция в комплекте", body: "Каждый ответ с текстом Библии содержит строку об авторских правах перевода. Указать источник можно одним полем." },
      { title: "Быстро на edge", body: "Отдаётся с edge-серверов Cloudflare с долгим кэшем и ETag. Повторная проверка возвращает пустой 304." },
      { title: "Без ключа и лимитов", body: "Без регистрации, без API-ключа, без ошибок 429. Открытый CORS: вызывайте с любой веб-страницы." },
    ],
  },
  quickStart: {
    title: "Получите стих одним вызовом",
    subtitle: "Вызывайте API напрямую. Без настройки и авторизации.",
    runIt: "Запустить вызов",
  },
  versions: {
    title: "Переводы и лицензии",
    subtitle: "Переводов: {versions}, языков: {languages}. Все в общественном достоянии или под свободной лицензией. Нажмите на перевод, чтобы увидеть метаданные и полный текст лицензии.",
    creditTitle: "Указывайте источник рядом с текстом",
    creditBody: "Каждый ответ с текстом Библии содержит сведения об авторских правах перевода: meta.copyright в v1, copyright в /v1/votd и в устаревших маршрутах. Показывайте их рядом с отрывком. Лицензии CC BY и CC BY-SA этого требуют.",
    aliasTitle: "Запросили перевод, которого больше нет?",
    aliasBody: "Переводы, все права на которые защищены (NIV, ESV, NLT, NVI, ARA, NVT, NTV и другие), не отдаются. Старые ссылки продолжают работать: вы получите свободный перевод на том же языке, а data.version покажет, какой именно.",
    labelPublicDomain: "Общественное достояние",
    labelTerms: "Свободное использование, см. условия",
    scopeFull: "ВЗ + НЗ",
    scopeOt: "Только ВЗ",
    scopeNt: "Только НЗ",
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
  more: {
    title: "Ещё от Midvash",
    subtitle: "Те же библейские данные для других сценариев.",
    mcpTitle: "MCP Библии",
    mcpBody: "Подключите Claude, Cursor и другие ИИ-ассистенты с поддержкой MCP к Библии.",
    wpTitle: "Плагин WordPress",
    wpBody: "Превращает библейские ссылки на вашем сайте во всплывающие подсказки с текстом стиха на основе этого API.",
    appTitle: "Midvash: Библия и размышления",
    appBody: "Ежедневные размышления с глубиной изучения Библии в вебе, на iOS и Android.",
    cta: "Подробнее",
  },
  faq: {
    title: "Частые вопросы",
    items: [
      { q: "Это правда бесплатно? Нужен ли API-ключ?", a: "Да. Без регистрации, без ключа и без лимита запросов. Просим только учитывать ETag (If-None-Match возвращает 304) и объединять ссылки через /v1/passages вместо отдельного запроса на каждый стих." },
      { q: "Какие переводы доступны?", a: "Переводов: {versions}, языков: {languages}. Все в общественном достоянии или под свободной лицензией, например CC BY или CC BY-SA. Актуальный список: /v1/versions." },
      { q: "Почему нет NIV или ESV?", a: "Их издатели сохраняют за собой все права, поэтому мы их не распространяем. На запрос такого перевода приходит свободный перевод на том же языке, а data.version показывает, какой." },
      { q: "Что нужно показывать в приложении?", a: "Сведения об авторских правах перевода из meta.copyright (или copyright в /v1/votd и устаревших маршрутах) рядом с текстом. Некоторые лицензии добавляют условия, например распространение на тех же условиях (CC BY-SA) или запрет изменять текст (CC BY-ND). Прочитайте полный текст лицензии выбранного перевода." },
      { q: "Есть ли спецификация OpenAPI?", a: "Да: /openapi.json (OpenAPI 3.1) и интерактивная справка на /docs. Для ИИ-агентов есть MCP Библии на mcp.midvash.com." },
    ],
  },
  footer: {
    builtBy: "Разработано",
    tagline: "Open source · Бесплатно навсегда · Без регистрации",
    ecosystemLabel: "Экосистема Midvash",
    productsLabel: "Продукты",
    openSourceLabel: "Open source",
    allReposLabel: "Все репозитории",
    ecosystem: {
      reader: "Библия и размышления",
      api: "API Библии",
      mcp: "MCP Библии",
      wordpress: "Плагин WordPress",
      chrome: "Расширение Chrome",
      ios: "Приложение iOS",
      android: "Приложение Android",
    },
    socialLabel: "Подписывайтесь",
    instagramLabel: "Посетите наш Instagram",
    copyright: "© 2025-{year} Midvash. Все права защищены.",
  },
};

const ko: Translations = {
  htmlLang: "ko",
  meta: {
    title: "무료 성경 API: {languages}개 언어, {versions}개 번역본 | Midvash",
    description: "키도, 요청 제한도 없는 무료 성경 REST API. {languages}개 언어, {versions}개 퍼블릭 도메인 및 공개 라이선스 번역본의 절, 장, 책 데이터를 제공합니다.",
  },
  nav: { skipToContent: "본문으로 건너뛰기" },
  hero: {
    eyebrow: "무료 · API 키 없음 · 요청 제한 없음",
    title: "성경 API",
    titleAccent: 'by Midvash',
    subtitle: "{languages}개 언어, {versions}개 자유 이용 성경 번역본의 절, 장, 책. HTTPS로 받는 JSON이라 브라우저에서 바로 호출할 수 있습니다. 가입도 키도 필요 없습니다.",
    ctaPrimary: "엔드포인트 보기",
    ctaSecondary: "빠른 시작",
    ctaDocs: "OpenAPI 레퍼런스",
  },
  features: {
    title: "이 API를 쓰는 이유",
    cards: [
      { title: "자유 이용 번역본 {versions}개", body: "개역한글판, KJV, BSB, 和合本, Louis Segond 등 {languages}개 언어. 모두 퍼블릭 도메인 또는 공개 라이선스입니다." },
      { title: "출처 표기 포함", body: "성경 본문이 담긴 모든 응답에 번역본의 저작권 문구가 함께 옵니다. 필드 하나만 읽으면 출처를 표기할 수 있습니다." },
      { title: "엣지에서 빠르게", body: "Cloudflare 엣지에서 장기 캐시와 ETag로 제공됩니다. 재검증 시 본문 없는 304를 반환합니다." },
      { title: "키 없음, 제한 없음", body: "가입도 API 키도 없고 429도 없습니다. CORS가 열려 있어 어떤 웹페이지에서든 호출할 수 있습니다." },
    ],
  },
  quickStart: {
    title: "한 번의 호출로 절을 가져오세요",
    subtitle: "API를 바로 호출하세요. 설정도 인증도 필요 없습니다.",
    runIt: "이 호출 실행하기",
  },
  versions: {
    title: "번역본과 라이선스",
    subtitle: "{languages}개 언어, {versions}개 번역본. 모두 퍼블릭 도메인 또는 공개 라이선스입니다. 번역본을 클릭하면 메타데이터와 라이선스 전문을 볼 수 있습니다.",
    creditTitle: "본문 옆에 출처를 표시하세요",
    creditBody: "성경 본문이 담긴 모든 응답에는 번역본의 출처 표기가 들어 있습니다. v1은 meta.copyright, /v1/votd와 레거시 경로는 copyright입니다. 본문 가까이에 표시하세요. CC BY와 CC BY-SA 라이선스는 이를 요구합니다.",
    aliasTitle: "더 이상 제공하지 않는 번역본을 요청했나요?",
    aliasBody: "모든 권리가 보호되는 번역본(NIV, ESV, NLT, NVI, ARA, NVT, NTV 등)은 제공하지 않습니다. 기존 링크는 계속 작동합니다. 같은 언어의 자유 이용 번역본이 반환되며, data.version에서 어떤 번역본인지 확인할 수 있습니다.",
    labelPublicDomain: "퍼블릭 도메인",
    labelTerms: "자유 이용, 조건 확인",
    scopeFull: "구약 + 신약",
    scopeOt: "구약만",
    scopeNt: "신약만",
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
  more: {
    title: "Midvash의 다른 도구",
    subtitle: "같은 성경 데이터를 다른 곳에서도.",
    mcpTitle: "성경 MCP",
    mcpBody: "Claude, Cursor 등 MCP를 지원하는 AI 어시스턴트를 성경에 연결하세요.",
    wpTitle: "WordPress 플러그인",
    wpBody: "이 API로 사이트의 성경 참조를 구절이 보이는 툴팁으로 바꿔 줍니다.",
    appTitle: "Midvash: 성경과 묵상",
    appBody: "성경 공부의 깊이를 담은 매일 묵상. 웹, iOS, Android에서 만나세요.",
    cta: "자세히 보기",
  },
  faq: {
    title: "자주 묻는 질문",
    items: [
      { q: "정말 무료인가요? API 키가 필요한가요?", a: "네. 가입도, 키도, 요청 제한도 없습니다. ETag를 지켜 주시고(If-None-Match는 304를 반환), 구절마다 요청하는 대신 /v1/passages로 묶어서 요청해 주세요." },
      { q: "어떤 번역본이 있나요?", a: "{languages}개 언어, {versions}개 번역본이 있으며 모두 퍼블릭 도메인이거나 CC BY, CC BY-SA 같은 공개 라이선스입니다. 최신 목록은 /v1/versions에서 볼 수 있습니다." },
      { q: "NIV나 ESV는 왜 없나요?", a: "해당 출판사가 모든 권리를 보유하고 있어 재배포하지 않습니다. 이런 번역본을 요청하면 같은 언어의 자유 이용 번역본이 반환되고, data.version에 어떤 번역본인지 표시됩니다." },
      { q: "앱에 무엇을 표시해야 하나요?", a: "meta.copyright(/v1/votd와 레거시 경로는 copyright)에 담긴 번역본 출처 표기를 본문 옆에 표시하세요. 일부 라이선스는 동일조건 변경허락(CC BY-SA)이나 변경 금지(CC BY-ND) 같은 조건을 추가로 둡니다. 선택한 번역본의 라이선스 전문을 확인하세요." },
      { q: "OpenAPI 명세가 있나요?", a: "네. /openapi.json(OpenAPI 3.1)과 /docs의 대화형 레퍼런스가 있습니다. AI 에이전트용으로는 mcp.midvash.com의 성경 MCP를 쓰세요." },
    ],
  },
  footer: {
    builtBy: "개발:",
    tagline: "오픈 소스 · 영구 무료 · 가입 불필요",
    ecosystemLabel: "Midvash 생태계",
    productsLabel: "제품",
    openSourceLabel: "오픈 소스",
    allReposLabel: "전체 저장소",
    ecosystem: {
      reader: "성경과 묵상",
      api: "성경 API",
      mcp: "성경 MCP",
      wordpress: "WordPress 플러그인",
      chrome: "Chrome 확장 프로그램",
      ios: "iOS 앱",
      android: "Android 앱",
    },
    socialLabel: "팔로우",
    instagramLabel: "인스타그램 방문",
    copyright: "© 2025-{year} Midvash. 모든 권리 보유.",
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
