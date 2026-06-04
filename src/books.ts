/**
 * Snapshot dos 66 livros da Bíblia × 9 locales (en, pt-br, es, fr, de, it, zh, ru, ko).
 * Sincronizado com packages/data/src/books.ts. Standalone — workers não
 * importam @midvash/i18n.
 */

export type Locale = 'en' | 'pt-br' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ru' | 'ko';

export interface BookDefinition {
    id: number;
    chapters: number;
    testament: 'old' | 'new';
    category: string;
    slugs: Record<Locale, string>;
    names: Record<Locale, string>;
    abbrev: Record<Locale, string>;
}

// Convenções:
// - slugs: lowercase, hifens entre palavras. Latim → ASCII transliterado.
//   zh/ru/ko mantém escrita nativa (alinhado com routes.json).
// - names: forma oficial padrão por idioma (Lutero p/ de, Synodal p/ ru,
//   CUV/CCB p/ zh, KRV p/ ko).
// - abbrev: abreviação canônica de cada tradição (3 chars Latim,
//   1-2 chars CJK/hangul/cirílico).
export const BOOKS: BookDefinition[] = [
    {
        id: 1,
        chapters: 50,
        testament: 'old',
        category: 'pentateuch',
        slugs: { en: 'genesis', 'pt-br': 'genesis', es: 'genesis', fr: 'genese', de: 'genesis', it: 'genesi', zh: '创世记', ru: 'бытие', ko: '창세기' },
        names: { en: 'Genesis', 'pt-br': 'Gênesis', es: 'Génesis', fr: 'Genèse', de: 'Genesis', it: 'Genesi', zh: '创世记', ru: 'Бытие', ko: '창세기' },
        abbrev: { en: 'Gen', 'pt-br': 'Gn', es: 'Gén', fr: 'Gn', de: 'Gen', it: 'Gen', zh: '创', ru: 'Быт', ko: '창' }
    },
    {
        id: 2,
        chapters: 40,
        testament: 'old',
        category: 'pentateuch',
        slugs: { en: 'exodus', 'pt-br': 'exodo', es: 'exodo', fr: 'exode', de: 'exodus', it: 'esodo', zh: '出埃及记', ru: 'исход', ko: '출애굽기' },
        names: { en: 'Exodus', 'pt-br': 'Êxodo', es: 'Éxodo', fr: 'Exode', de: 'Exodus', it: 'Esodo', zh: '出埃及记', ru: 'Исход', ko: '출애굽기' },
        abbrev: { en: 'Exo', 'pt-br': 'Êx', es: 'Éx', fr: 'Ex', de: 'Ex', it: 'Es', zh: '出', ru: 'Исх', ko: '출' }
    },
    {
        id: 3,
        chapters: 27,
        testament: 'old',
        category: 'pentateuch',
        slugs: { en: 'leviticus', 'pt-br': 'levitico', es: 'levitico', fr: 'levitique', de: 'levitikus', it: 'levitico', zh: '利未记', ru: 'левит', ko: '레위기' },
        names: { en: 'Leviticus', 'pt-br': 'Levítico', es: 'Levítico', fr: 'Lévitique', de: 'Levitikus', it: 'Levitico', zh: '利未记', ru: 'Левит', ko: '레위기' },
        abbrev: { en: 'Lev', 'pt-br': 'Lv', es: 'Lv', fr: 'Lv', de: 'Lev', it: 'Lv', zh: '利', ru: 'Лев', ko: '레' }
    },
    {
        id: 4,
        chapters: 36,
        testament: 'old',
        category: 'pentateuch',
        slugs: { en: 'numbers', 'pt-br': 'numeros', es: 'numeros', fr: 'nombres', de: 'numeri', it: 'numeri', zh: '民数记', ru: 'числа', ko: '민수기' },
        names: { en: 'Numbers', 'pt-br': 'Números', es: 'Números', fr: 'Nombres', de: 'Numeri', it: 'Numeri', zh: '民数记', ru: 'Числа', ko: '민수기' },
        abbrev: { en: 'Num', 'pt-br': 'Nm', es: 'Núm', fr: 'Nb', de: 'Num', it: 'Nm', zh: '民', ru: 'Чис', ko: '민' }
    },
    {
        id: 5,
        chapters: 34,
        testament: 'old',
        category: 'pentateuch',
        slugs: { en: 'deuteronomy', 'pt-br': 'deuteronomio', es: 'deuteronomio', fr: 'deuteronome', de: 'deuteronomium', it: 'deuteronomio', zh: '申命记', ru: 'второзаконие', ko: '신명기' },
        names: { en: 'Deuteronomy', 'pt-br': 'Deuteronômio', es: 'Deuteronomio', fr: 'Deutéronome', de: 'Deuteronomium', it: 'Deuteronomio', zh: '申命记', ru: 'Второзаконие', ko: '신명기' },
        abbrev: { en: 'Deu', 'pt-br': 'Dt', es: 'Dt', fr: 'Dt', de: 'Dtn', it: 'Dt', zh: '申', ru: 'Втор', ko: '신' }
    },
    {
        id: 6,
        chapters: 24,
        testament: 'old',
        category: 'historical',
        slugs: { en: 'joshua', 'pt-br': 'josue', es: 'josue', fr: 'josue', de: 'josua', it: 'giosue', zh: '约书亚记', ru: 'иисус-навин', ko: '여호수아' },
        names: { en: 'Joshua', 'pt-br': 'Josué', es: 'Josué', fr: 'Josué', de: 'Josua', it: 'Giosuè', zh: '约书亚记', ru: 'Иисус Навин', ko: '여호수아' },
        abbrev: { en: 'Jos', 'pt-br': 'Js', es: 'Jos', fr: 'Jos', de: 'Jos', it: 'Gs', zh: '书', ru: 'Нав', ko: '수' }
    },
    {
        id: 7,
        chapters: 21,
        testament: 'old',
        category: 'historical',
        slugs: { en: 'judges', 'pt-br': 'juizes', es: 'jueces', fr: 'juges', de: 'richter', it: 'giudici', zh: '士师记', ru: 'судьи', ko: '사사기' },
        names: { en: 'Judges', 'pt-br': 'Juízes', es: 'Jueces', fr: 'Juges', de: 'Richter', it: 'Giudici', zh: '士师记', ru: 'Судьи', ko: '사사기' },
        abbrev: { en: 'Jdg', 'pt-br': 'Jz', es: 'Jue', fr: 'Jg', de: 'Ri', it: 'Gdc', zh: '士', ru: 'Суд', ko: '삿' }
    },
    {
        id: 8,
        chapters: 4,
        testament: 'old',
        category: 'historical',
        slugs: { en: 'ruth', 'pt-br': 'rute', es: 'rut', fr: 'ruth', de: 'rut', it: 'rut', zh: '路得记', ru: 'руфь', ko: '룻기' },
        names: { en: 'Ruth', 'pt-br': 'Rute', es: 'Rut', fr: 'Ruth', de: 'Rut', it: 'Rut', zh: '路得记', ru: 'Руфь', ko: '룻기' },
        abbrev: { en: 'Rut', 'pt-br': 'Rt', es: 'Rut', fr: 'Rt', de: 'Rut', it: 'Rt', zh: '得', ru: 'Руф', ko: '룻' }
    },
    {
        id: 9,
        chapters: 31,
        testament: 'old',
        category: 'historical',
        slugs: { en: '1-samuel', 'pt-br': '1-samuel', es: '1-samuel', fr: '1-samuel', de: '1-samuel', it: '1-samuele', zh: '撒母耳记上', ru: '1-царств', ko: '사무엘상' },
        names: { en: '1 Samuel', 'pt-br': '1 Samuel', es: '1 Samuel', fr: '1 Samuel', de: '1 Samuel', it: '1 Samuele', zh: '撒母耳记上', ru: '1 Царств', ko: '사무엘상' },
        abbrev: { en: '1Sa', 'pt-br': '1Sm', es: '1Sa', fr: '1S', de: '1Sam', it: '1Sam', zh: '撒上', ru: '1Цар', ko: '삼상' }
    },
    {
        id: 10,
        chapters: 24,
        testament: 'old',
        category: 'historical',
        slugs: { en: '2-samuel', 'pt-br': '2-samuel', es: '2-samuel', fr: '2-samuel', de: '2-samuel', it: '2-samuele', zh: '撒母耳记下', ru: '2-царств', ko: '사무엘하' },
        names: { en: '2 Samuel', 'pt-br': '2 Samuel', es: '2 Samuel', fr: '2 Samuel', de: '2 Samuel', it: '2 Samuele', zh: '撒母耳记下', ru: '2 Царств', ko: '사무엘하' },
        abbrev: { en: '2Sa', 'pt-br': '2Sm', es: '2Sa', fr: '2S', de: '2Sam', it: '2Sam', zh: '撒下', ru: '2Цар', ko: '삼하' }
    },
    {
        id: 11,
        chapters: 22,
        testament: 'old',
        category: 'historical',
        slugs: { en: '1-kings', 'pt-br': '1-reis', es: '1-reyes', fr: '1-rois', de: '1-koenige', it: '1-re', zh: '列王纪上', ru: '3-царств', ko: '열왕기상' },
        names: { en: '1 Kings', 'pt-br': '1 Reis', es: '1 Reyes', fr: '1 Rois', de: '1 Könige', it: '1 Re', zh: '列王纪上', ru: '3 Царств', ko: '열왕기상' },
        abbrev: { en: '1Ki', 'pt-br': '1Rs', es: '1Re', fr: '1R', de: '1Kön', it: '1Re', zh: '王上', ru: '3Цар', ko: '왕상' }
    },
    {
        id: 12,
        chapters: 25,
        testament: 'old',
        category: 'historical',
        slugs: { en: '2-kings', 'pt-br': '2-reis', es: '2-reyes', fr: '2-rois', de: '2-koenige', it: '2-re', zh: '列王纪下', ru: '4-царств', ko: '열왕기하' },
        names: { en: '2 Kings', 'pt-br': '2 Reis', es: '2 Reyes', fr: '2 Rois', de: '2 Könige', it: '2 Re', zh: '列王纪下', ru: '4 Царств', ko: '열왕기하' },
        abbrev: { en: '2Ki', 'pt-br': '2Rs', es: '2Re', fr: '2R', de: '2Kön', it: '2Re', zh: '王下', ru: '4Цар', ko: '왕하' }
    },
    {
        id: 13,
        chapters: 29,
        testament: 'old',
        category: 'historical',
        slugs: { en: '1-chronicles', 'pt-br': '1-cronicas', es: '1-cronicas', fr: '1-chroniques', de: '1-chronik', it: '1-cronache', zh: '历代志上', ru: '1-паралипоменон', ko: '역대상' },
        names: { en: '1 Chronicles', 'pt-br': '1 Crônicas', es: '1 Crónicas', fr: '1 Chroniques', de: '1 Chronik', it: '1 Cronache', zh: '历代志上', ru: '1 Паралипоменон', ko: '역대상' },
        abbrev: { en: '1Ch', 'pt-br': '1Cr', es: '1Cr', fr: '1Ch', de: '1Chr', it: '1Cr', zh: '代上', ru: '1Пар', ko: '대상' }
    },
    {
        id: 14,
        chapters: 36,
        testament: 'old',
        category: 'historical',
        slugs: { en: '2-chronicles', 'pt-br': '2-cronicas', es: '2-cronicas', fr: '2-chroniques', de: '2-chronik', it: '2-cronache', zh: '历代志下', ru: '2-паралипоменон', ko: '역대하' },
        names: { en: '2 Chronicles', 'pt-br': '2 Crônicas', es: '2 Crónicas', fr: '2 Chroniques', de: '2 Chronik', it: '2 Cronache', zh: '历代志下', ru: '2 Паралипоменон', ko: '역대하' },
        abbrev: { en: '2Ch', 'pt-br': '2Cr', es: '2Cr', fr: '2Ch', de: '2Chr', it: '2Cr', zh: '代下', ru: '2Пар', ko: '대하' }
    },
    {
        id: 15,
        chapters: 10,
        testament: 'old',
        category: 'historical',
        slugs: { en: 'ezra', 'pt-br': 'esdras', es: 'esdras', fr: 'esdras', de: 'esra', it: 'esdra', zh: '以斯拉记', ru: 'ездра', ko: '에스라' },
        names: { en: 'Ezra', 'pt-br': 'Esdras', es: 'Esdras', fr: 'Esdras', de: 'Esra', it: 'Esdra', zh: '以斯拉记', ru: 'Ездра', ko: '에스라' },
        abbrev: { en: 'Ezr', 'pt-br': 'Ed', es: 'Esd', fr: 'Esd', de: 'Esr', it: 'Esd', zh: '拉', ru: 'Езд', ko: '스' }
    },
    {
        id: 16,
        chapters: 13,
        testament: 'old',
        category: 'historical',
        slugs: { en: 'nehemiah', 'pt-br': 'neemias', es: 'nehemias', fr: 'nehemie', de: 'nehemia', it: 'neemia', zh: '尼希米记', ru: 'неемия', ko: '느헤미야' },
        names: { en: 'Nehemiah', 'pt-br': 'Neemias', es: 'Nehemías', fr: 'Néhémie', de: 'Nehemia', it: 'Neemia', zh: '尼希米记', ru: 'Неемия', ko: '느헤미야' },
        abbrev: { en: 'Neh', 'pt-br': 'Ne', es: 'Neh', fr: 'Né', de: 'Neh', it: 'Ne', zh: '尼', ru: 'Неем', ko: '느' }
    },
    {
        id: 17,
        chapters: 10,
        testament: 'old',
        category: 'historical',
        slugs: { en: 'esther', 'pt-br': 'ester', es: 'ester', fr: 'esther', de: 'ester', it: 'ester', zh: '以斯帖记', ru: 'есфирь', ko: '에스더' },
        names: { en: 'Esther', 'pt-br': 'Ester', es: 'Ester', fr: 'Esther', de: 'Ester', it: 'Ester', zh: '以斯帖记', ru: 'Есфирь', ko: '에스더' },
        abbrev: { en: 'Est', 'pt-br': 'Et', es: 'Est', fr: 'Est', de: 'Est', it: 'Est', zh: '斯', ru: 'Есф', ko: '에' }
    },
    {
        id: 18,
        chapters: 42,
        testament: 'old',
        category: 'poetry',
        slugs: { en: 'job', 'pt-br': 'jo', es: 'job', fr: 'job', de: 'hiob', it: 'giobbe', zh: '约伯记', ru: 'иов', ko: '욥기' },
        names: { en: 'Job', 'pt-br': 'Jó', es: 'Job', fr: 'Job', de: 'Hiob', it: 'Giobbe', zh: '约伯记', ru: 'Иов', ko: '욥기' },
        abbrev: { en: 'Job', 'pt-br': 'Jó', es: 'Job', fr: 'Jb', de: 'Hi', it: 'Gb', zh: '伯', ru: 'Иов', ko: '욥' }
    },
    {
        id: 19,
        chapters: 150,
        testament: 'old',
        category: 'poetry',
        slugs: { en: 'psalms', 'pt-br': 'salmos', es: 'salmos', fr: 'psaumes', de: 'psalmen', it: 'salmi', zh: '诗篇', ru: 'псалтирь', ko: '시편' },
        names: { en: 'Psalms', 'pt-br': 'Salmos', es: 'Salmos', fr: 'Psaumes', de: 'Psalmen', it: 'Salmi', zh: '诗篇', ru: 'Псалтирь', ko: '시편' },
        abbrev: { en: 'Psa', 'pt-br': 'Sl', es: 'Sal', fr: 'Ps', de: 'Ps', it: 'Sal', zh: '诗', ru: 'Пс', ko: '시' }
    },
    {
        id: 20,
        chapters: 31,
        testament: 'old',
        category: 'poetry',
        slugs: { en: 'proverbs', 'pt-br': 'proverbios', es: 'proverbios', fr: 'proverbes', de: 'sprueche', it: 'proverbi', zh: '箴言', ru: 'притчи', ko: '잠언' },
        names: { en: 'Proverbs', 'pt-br': 'Provérbios', es: 'Proverbios', fr: 'Proverbes', de: 'Sprüche', it: 'Proverbi', zh: '箴言', ru: 'Притчи', ko: '잠언' },
        abbrev: { en: 'Pro', 'pt-br': 'Pv', es: 'Pr', fr: 'Pr', de: 'Spr', it: 'Pr', zh: '箴', ru: 'Прит', ko: '잠' }
    },
    {
        id: 21,
        chapters: 12,
        testament: 'old',
        category: 'poetry',
        slugs: { en: 'ecclesiastes', 'pt-br': 'eclesiastes', es: 'eclesiastes', fr: 'ecclesiaste', de: 'prediger', it: 'ecclesiaste', zh: '传道书', ru: 'екклесиаст', ko: '전도서' },
        names: { en: 'Ecclesiastes', 'pt-br': 'Eclesiastes', es: 'Eclesiastés', fr: 'Ecclésiaste', de: 'Prediger', it: 'Ecclesiaste', zh: '传道书', ru: 'Екклесиаст', ko: '전도서' },
        abbrev: { en: 'Ecc', 'pt-br': 'Ec', es: 'Ecl', fr: 'Ec', de: 'Pred', it: 'Qo', zh: '传', ru: 'Еккл', ko: '전' }
    },
    {
        id: 22,
        chapters: 8,
        testament: 'old',
        category: 'poetry',
        slugs: { en: 'song-of-solomon', 'pt-br': 'canticos', es: 'cantares', fr: 'cantique-des-cantiques', de: 'hohelied', it: 'cantico-dei-cantici', zh: '雅歌', ru: 'песнь-песней', ko: '아가' },
        names: { en: 'Song of Solomon', 'pt-br': 'Cânticos', es: 'Cantares', fr: 'Cantique des Cantiques', de: 'Hohelied', it: 'Cantico dei Cantici', zh: '雅歌', ru: 'Песнь Песней', ko: '아가' },
        abbrev: { en: 'Sng', 'pt-br': 'Ct', es: 'Cnt', fr: 'Ct', de: 'Hld', it: 'Ct', zh: '歌', ru: 'Песн', ko: '아' }
    },
    {
        id: 23,
        chapters: 66,
        testament: 'old',
        category: 'major-prophets',
        slugs: { en: 'isaiah', 'pt-br': 'isaias', es: 'isaias', fr: 'esaie', de: 'jesaja', it: 'isaia', zh: '以赛亚书', ru: 'исаия', ko: '이사야' },
        names: { en: 'Isaiah', 'pt-br': 'Isaías', es: 'Isaías', fr: 'Ésaïe', de: 'Jesaja', it: 'Isaia', zh: '以赛亚书', ru: 'Исаия', ko: '이사야' },
        abbrev: { en: 'Isa', 'pt-br': 'Is', es: 'Is', fr: 'És', de: 'Jes', it: 'Is', zh: '赛', ru: 'Ис', ko: '사' }
    },
    {
        id: 24,
        chapters: 52,
        testament: 'old',
        category: 'major-prophets',
        slugs: { en: 'jeremiah', 'pt-br': 'jeremias', es: 'jeremias', fr: 'jeremie', de: 'jeremia', it: 'geremia', zh: '耶利米书', ru: 'иеремия', ko: '예레미야' },
        names: { en: 'Jeremiah', 'pt-br': 'Jeremias', es: 'Jeremías', fr: 'Jérémie', de: 'Jeremia', it: 'Geremia', zh: '耶利米书', ru: 'Иеремия', ko: '예레미야' },
        abbrev: { en: 'Jer', 'pt-br': 'Jr', es: 'Jer', fr: 'Jr', de: 'Jer', it: 'Ger', zh: '耶', ru: 'Иер', ko: '렘' }
    },
    {
        id: 25,
        chapters: 5,
        testament: 'old',
        category: 'major-prophets',
        slugs: { en: 'lamentations', 'pt-br': 'lamentacoes', es: 'lamentaciones', fr: 'lamentations', de: 'klagelieder', it: 'lamentazioni', zh: '耶利米哀歌', ru: 'плач-иеремии', ko: '예레미야애가' },
        names: { en: 'Lamentations', 'pt-br': 'Lamentações', es: 'Lamentaciones', fr: 'Lamentations', de: 'Klagelieder', it: 'Lamentazioni', zh: '耶利米哀歌', ru: 'Плач Иеремии', ko: '예레미야애가' },
        abbrev: { en: 'Lam', 'pt-br': 'Lm', es: 'Lam', fr: 'Lm', de: 'Klgl', it: 'Lam', zh: '哀', ru: 'Плач', ko: '애' }
    },
    {
        id: 26,
        chapters: 48,
        testament: 'old',
        category: 'major-prophets',
        slugs: { en: 'ezekiel', 'pt-br': 'ezequiel', es: 'ezequiel', fr: 'ezechiel', de: 'hesekiel', it: 'ezechiele', zh: '以西结书', ru: 'иезекииль', ko: '에스겔' },
        names: { en: 'Ezekiel', 'pt-br': 'Ezequiel', es: 'Ezequiel', fr: 'Ézéchiel', de: 'Hesekiel', it: 'Ezechiele', zh: '以西结书', ru: 'Иезекииль', ko: '에스겔' },
        abbrev: { en: 'Eze', 'pt-br': 'Ez', es: 'Ez', fr: 'Éz', de: 'Hes', it: 'Ez', zh: '结', ru: 'Иез', ko: '겔' }
    },
    {
        id: 27,
        chapters: 12,
        testament: 'old',
        category: 'major-prophets',
        slugs: { en: 'daniel', 'pt-br': 'daniel', es: 'daniel', fr: 'daniel', de: 'daniel', it: 'daniele', zh: '但以理书', ru: 'даниил', ko: '다니엘' },
        names: { en: 'Daniel', 'pt-br': 'Daniel', es: 'Daniel', fr: 'Daniel', de: 'Daniel', it: 'Daniele', zh: '但以理书', ru: 'Даниил', ko: '다니엘' },
        abbrev: { en: 'Dan', 'pt-br': 'Dn', es: 'Dn', fr: 'Dn', de: 'Dan', it: 'Dn', zh: '但', ru: 'Дан', ko: '단' }
    },
    {
        id: 28,
        chapters: 14,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'hosea', 'pt-br': 'oseias', es: 'oseas', fr: 'osee', de: 'hosea', it: 'osea', zh: '何西阿书', ru: 'осия', ko: '호세아' },
        names: { en: 'Hosea', 'pt-br': 'Oseias', es: 'Oseas', fr: 'Osée', de: 'Hosea', it: 'Osea', zh: '何西阿书', ru: 'Осия', ko: '호세아' },
        abbrev: { en: 'Hos', 'pt-br': 'Os', es: 'Os', fr: 'Os', de: 'Hos', it: 'Os', zh: '何', ru: 'Ос', ko: '호' }
    },
    {
        id: 29,
        chapters: 3,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'joel', 'pt-br': 'joel', es: 'joel', fr: 'joel', de: 'joel', it: 'gioele', zh: '约珥书', ru: 'иоиль', ko: '요엘' },
        names: { en: 'Joel', 'pt-br': 'Joel', es: 'Joel', fr: 'Joël', de: 'Joel', it: 'Gioele', zh: '约珥书', ru: 'Иоиль', ko: '요엘' },
        abbrev: { en: 'Joe', 'pt-br': 'Jl', es: 'Jl', fr: 'Jl', de: 'Joel', it: 'Gl', zh: '珥', ru: 'Иоил', ko: '욜' }
    },
    {
        id: 30,
        chapters: 9,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'amos', 'pt-br': 'amos', es: 'amos', fr: 'amos', de: 'amos', it: 'amos', zh: '阿摩司书', ru: 'амос', ko: '아모스' },
        names: { en: 'Amos', 'pt-br': 'Amós', es: 'Amós', fr: 'Amos', de: 'Amos', it: 'Amos', zh: '阿摩司书', ru: 'Амос', ko: '아모스' },
        abbrev: { en: 'Amo', 'pt-br': 'Am', es: 'Am', fr: 'Am', de: 'Am', it: 'Am', zh: '摩', ru: 'Ам', ko: '암' }
    },
    {
        id: 31,
        chapters: 1,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'obadiah', 'pt-br': 'obadias', es: 'abdias', fr: 'abdias', de: 'obadja', it: 'abdia', zh: '俄巴底亚书', ru: 'авдий', ko: '오바댜' },
        names: { en: 'Obadiah', 'pt-br': 'Obadias', es: 'Abdías', fr: 'Abdias', de: 'Obadja', it: 'Abdia', zh: '俄巴底亚书', ru: 'Авдий', ko: '오바댜' },
        abbrev: { en: 'Oba', 'pt-br': 'Ob', es: 'Abd', fr: 'Ab', de: 'Obd', it: 'Abd', zh: '俄', ru: 'Авд', ko: '옵' }
    },
    {
        id: 32,
        chapters: 4,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'jonah', 'pt-br': 'jonas', es: 'jonas', fr: 'jonas', de: 'jona', it: 'giona', zh: '约拿书', ru: 'иона', ko: '요나' },
        names: { en: 'Jonah', 'pt-br': 'Jonas', es: 'Jonás', fr: 'Jonas', de: 'Jona', it: 'Giona', zh: '约拿书', ru: 'Иона', ko: '요나' },
        abbrev: { en: 'Jon', 'pt-br': 'Jn', es: 'Jon', fr: 'Jon', de: 'Jona', it: 'Gio', zh: '拿', ru: 'Ион', ko: '욘' }
    },
    {
        id: 33,
        chapters: 7,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'micah', 'pt-br': 'miqueias', es: 'miqueas', fr: 'michee', de: 'micha', it: 'michea', zh: '弥迦书', ru: 'михей', ko: '미가' },
        names: { en: 'Micah', 'pt-br': 'Miqueias', es: 'Miqueas', fr: 'Michée', de: 'Micha', it: 'Michea', zh: '弥迦书', ru: 'Михей', ko: '미가' },
        abbrev: { en: 'Mic', 'pt-br': 'Mq', es: 'Miq', fr: 'Mi', de: 'Mi', it: 'Mi', zh: '弥', ru: 'Мих', ko: '미' }
    },
    {
        id: 34,
        chapters: 3,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'nahum', 'pt-br': 'naum', es: 'nahum', fr: 'nahum', de: 'nahum', it: 'naum', zh: '那鸿书', ru: 'наум', ko: '나훔' },
        names: { en: 'Nahum', 'pt-br': 'Naum', es: 'Nahúm', fr: 'Nahum', de: 'Nahum', it: 'Naum', zh: '那鸿书', ru: 'Наум', ko: '나훔' },
        abbrev: { en: 'Nah', 'pt-br': 'Na', es: 'Nah', fr: 'Na', de: 'Nah', it: 'Na', zh: '鸿', ru: 'Наум', ko: '나' }
    },
    {
        id: 35,
        chapters: 3,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'habakkuk', 'pt-br': 'habacuque', es: 'habacuc', fr: 'habacuc', de: 'habakuk', it: 'abacuc', zh: '哈巴谷书', ru: 'аввакум', ko: '하박국' },
        names: { en: 'Habakkuk', 'pt-br': 'Habacuque', es: 'Habacuc', fr: 'Habacuc', de: 'Habakuk', it: 'Abacuc', zh: '哈巴谷书', ru: 'Аввакум', ko: '하박국' },
        abbrev: { en: 'Hab', 'pt-br': 'Hc', es: 'Hab', fr: 'Ha', de: 'Hab', it: 'Ab', zh: '哈', ru: 'Авв', ko: '합' }
    },
    {
        id: 36,
        chapters: 3,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'zephaniah', 'pt-br': 'sofonias', es: 'sofonias', fr: 'sophonie', de: 'zefanja', it: 'sofonia', zh: '西番雅书', ru: 'софония', ko: '스바냐' },
        names: { en: 'Zephaniah', 'pt-br': 'Sofonias', es: 'Sofonías', fr: 'Sophonie', de: 'Zefanja', it: 'Sofonia', zh: '西番雅书', ru: 'Софония', ko: '스바냐' },
        abbrev: { en: 'Zep', 'pt-br': 'Sf', es: 'Sof', fr: 'So', de: 'Zef', it: 'Sof', zh: '番', ru: 'Соф', ko: '습' }
    },
    {
        id: 37,
        chapters: 2,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'haggai', 'pt-br': 'ageu', es: 'hageo', fr: 'aggee', de: 'haggai', it: 'aggeo', zh: '哈该书', ru: 'аггей', ko: '학개' },
        names: { en: 'Haggai', 'pt-br': 'Ageu', es: 'Hageo', fr: 'Aggée', de: 'Haggai', it: 'Aggeo', zh: '哈该书', ru: 'Аггей', ko: '학개' },
        abbrev: { en: 'Hag', 'pt-br': 'Ag', es: 'Hag', fr: 'Ag', de: 'Hag', it: 'Ag', zh: '该', ru: 'Агг', ko: '학' }
    },
    {
        id: 38,
        chapters: 14,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'zechariah', 'pt-br': 'zacarias', es: 'zacarias', fr: 'zacharie', de: 'sacharja', it: 'zaccaria', zh: '撒迦利亚书', ru: 'захария', ko: '스가랴' },
        names: { en: 'Zechariah', 'pt-br': 'Zacarias', es: 'Zacarías', fr: 'Zacharie', de: 'Sacharja', it: 'Zaccaria', zh: '撒迦利亚书', ru: 'Захария', ko: '스가랴' },
        abbrev: { en: 'Zec', 'pt-br': 'Zc', es: 'Zac', fr: 'Za', de: 'Sach', it: 'Zc', zh: '亚', ru: 'Зах', ko: '슥' }
    },
    {
        id: 39,
        chapters: 4,
        testament: 'old',
        category: 'minor-prophets',
        slugs: { en: 'malachi', 'pt-br': 'malaquias', es: 'malaquias', fr: 'malachie', de: 'maleachi', it: 'malachia', zh: '玛拉基书', ru: 'малахия', ko: '말라기' },
        names: { en: 'Malachi', 'pt-br': 'Malaquias', es: 'Malaquías', fr: 'Malachie', de: 'Maleachi', it: 'Malachia', zh: '玛拉基书', ru: 'Малахия', ko: '말라기' },
        abbrev: { en: 'Mal', 'pt-br': 'Ml', es: 'Mal', fr: 'Ml', de: 'Mal', it: 'Ml', zh: '玛', ru: 'Мал', ko: '말' }
    },
    {
        id: 40,
        chapters: 28,
        testament: 'new',
        category: 'gospels',
        slugs: { en: 'matthew', 'pt-br': 'mateus', es: 'mateo', fr: 'matthieu', de: 'matthaeus', it: 'matteo', zh: '马太福音', ru: 'матфей', ko: '마태복음' },
        names: { en: 'Matthew', 'pt-br': 'Mateus', es: 'Mateo', fr: 'Matthieu', de: 'Matthäus', it: 'Matteo', zh: '马太福音', ru: 'Матфей', ko: '마태복음' },
        abbrev: { en: 'Mat', 'pt-br': 'Mt', es: 'Mt', fr: 'Mt', de: 'Mt', it: 'Mt', zh: '太', ru: 'Мф', ko: '마' }
    },
    {
        id: 41,
        chapters: 16,
        testament: 'new',
        category: 'gospels',
        slugs: { en: 'mark', 'pt-br': 'marcos', es: 'marcos', fr: 'marc', de: 'markus', it: 'marco', zh: '马可福音', ru: 'марк', ko: '마가복음' },
        names: { en: 'Mark', 'pt-br': 'Marcos', es: 'Marcos', fr: 'Marc', de: 'Markus', it: 'Marco', zh: '马可福音', ru: 'Марк', ko: '마가복음' },
        abbrev: { en: 'Mar', 'pt-br': 'Mc', es: 'Mr', fr: 'Mc', de: 'Mk', it: 'Mc', zh: '可', ru: 'Мк', ko: '막' }
    },
    {
        id: 42,
        chapters: 24,
        testament: 'new',
        category: 'gospels',
        slugs: { en: 'luke', 'pt-br': 'lucas', es: 'lucas', fr: 'luc', de: 'lukas', it: 'luca', zh: '路加福音', ru: 'лука', ko: '누가복음' },
        names: { en: 'Luke', 'pt-br': 'Lucas', es: 'Lucas', fr: 'Luc', de: 'Lukas', it: 'Luca', zh: '路加福音', ru: 'Лука', ko: '누가복음' },
        abbrev: { en: 'Luk', 'pt-br': 'Lc', es: 'Lc', fr: 'Lc', de: 'Lk', it: 'Lc', zh: '路', ru: 'Лк', ko: '눅' }
    },
    {
        id: 43,
        chapters: 21,
        testament: 'new',
        category: 'gospels',
        slugs: { en: 'john', 'pt-br': 'joao', es: 'juan', fr: 'jean', de: 'johannes', it: 'giovanni', zh: '约翰福音', ru: 'иоанн', ko: '요한복음' },
        names: { en: 'John', 'pt-br': 'João', es: 'Juan', fr: 'Jean', de: 'Johannes', it: 'Giovanni', zh: '约翰福音', ru: 'Иоанн', ko: '요한복음' },
        abbrev: { en: 'Joh', 'pt-br': 'Jo', es: 'Jn', fr: 'Jn', de: 'Joh', it: 'Gv', zh: '约', ru: 'Ин', ko: '요' }
    },
    {
        id: 44,
        chapters: 28,
        testament: 'new',
        category: 'historical',
        slugs: { en: 'acts', 'pt-br': 'atos', es: 'hechos', fr: 'actes', de: 'apostelgeschichte', it: 'atti', zh: '使徒行传', ru: 'деяния', ko: '사도행전' },
        names: { en: 'Acts', 'pt-br': 'Atos', es: 'Hechos', fr: 'Actes', de: 'Apostelgeschichte', it: 'Atti', zh: '使徒行传', ru: 'Деяния', ko: '사도행전' },
        abbrev: { en: 'Act', 'pt-br': 'At', es: 'Hch', fr: 'Ac', de: 'Apg', it: 'At', zh: '徒', ru: 'Деян', ko: '행' }
    },
    {
        id: 45,
        chapters: 16,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'romans', 'pt-br': 'romanos', es: 'romanos', fr: 'romains', de: 'roemer', it: 'romani', zh: '罗马书', ru: 'римлянам', ko: '로마서' },
        names: { en: 'Romans', 'pt-br': 'Romanos', es: 'Romanos', fr: 'Romains', de: 'Römer', it: 'Romani', zh: '罗马书', ru: 'Римлянам', ko: '로마서' },
        abbrev: { en: 'Rom', 'pt-br': 'Rm', es: 'Ro', fr: 'Rm', de: 'Röm', it: 'Rm', zh: '罗', ru: 'Рим', ko: '롬' }
    },
    {
        id: 46,
        chapters: 16,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: '1-corinthians', 'pt-br': '1-corintios', es: '1-corintios', fr: '1-corinthiens', de: '1-korinther', it: '1-corinzi', zh: '哥林多前书', ru: '1-коринфянам', ko: '고린도전서' },
        names: { en: '1 Corinthians', 'pt-br': '1 Coríntios', es: '1 Corintios', fr: '1 Corinthiens', de: '1 Korinther', it: '1 Corinzi', zh: '哥林多前书', ru: '1 Коринфянам', ko: '고린도전서' },
        abbrev: { en: '1Co', 'pt-br': '1Co', es: '1Co', fr: '1Co', de: '1Kor', it: '1Cor', zh: '林前', ru: '1Кор', ko: '고전' }
    },
    {
        id: 47,
        chapters: 13,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: '2-corinthians', 'pt-br': '2-corintios', es: '2-corintios', fr: '2-corinthiens', de: '2-korinther', it: '2-corinzi', zh: '哥林多后书', ru: '2-коринфянам', ko: '고린도후서' },
        names: { en: '2 Corinthians', 'pt-br': '2 Coríntios', es: '2 Corintios', fr: '2 Corinthiens', de: '2 Korinther', it: '2 Corinzi', zh: '哥林多后书', ru: '2 Коринфянам', ko: '고린도후서' },
        abbrev: { en: '2Co', 'pt-br': '2Co', es: '2Co', fr: '2Co', de: '2Kor', it: '2Cor', zh: '林后', ru: '2Кор', ko: '고후' }
    },
    {
        id: 48,
        chapters: 6,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'galatians', 'pt-br': 'galatas', es: 'galatas', fr: 'galates', de: 'galater', it: 'galati', zh: '加拉太书', ru: 'галатам', ko: '갈라디아서' },
        names: { en: 'Galatians', 'pt-br': 'Gálatas', es: 'Gálatas', fr: 'Galates', de: 'Galater', it: 'Galati', zh: '加拉太书', ru: 'Галатам', ko: '갈라디아서' },
        abbrev: { en: 'Gal', 'pt-br': 'Gl', es: 'Gá', fr: 'Ga', de: 'Gal', it: 'Gal', zh: '加', ru: 'Гал', ko: '갈' }
    },
    {
        id: 49,
        chapters: 6,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'ephesians', 'pt-br': 'efesios', es: 'efesios', fr: 'ephesiens', de: 'epheser', it: 'efesini', zh: '以弗所书', ru: 'ефесянам', ko: '에베소서' },
        names: { en: 'Ephesians', 'pt-br': 'Efésios', es: 'Efesios', fr: 'Éphésiens', de: 'Epheser', it: 'Efesini', zh: '以弗所书', ru: 'Ефесянам', ko: '에베소서' },
        abbrev: { en: 'Eph', 'pt-br': 'Ef', es: 'Ef', fr: 'Ép', de: 'Eph', it: 'Ef', zh: '弗', ru: 'Еф', ko: '엡' }
    },
    {
        id: 50,
        chapters: 4,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'philippians', 'pt-br': 'filipenses', es: 'filipenses', fr: 'philippiens', de: 'philipper', it: 'filippesi', zh: '腓立比书', ru: 'филиппийцам', ko: '빌립보서' },
        names: { en: 'Philippians', 'pt-br': 'Filipenses', es: 'Filipenses', fr: 'Philippiens', de: 'Philipper', it: 'Filippesi', zh: '腓立比书', ru: 'Филиппийцам', ko: '빌립보서' },
        abbrev: { en: 'Php', 'pt-br': 'Fp', es: 'Fil', fr: 'Ph', de: 'Phil', it: 'Fil', zh: '腓', ru: 'Флп', ko: '빌' }
    },
    {
        id: 51,
        chapters: 4,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'colossians', 'pt-br': 'colossenses', es: 'colosenses', fr: 'colossiens', de: 'kolosser', it: 'colossesi', zh: '歌罗西书', ru: 'колоссянам', ko: '골로새서' },
        names: { en: 'Colossians', 'pt-br': 'Colossenses', es: 'Colosenses', fr: 'Colossiens', de: 'Kolosser', it: 'Colossesi', zh: '歌罗西书', ru: 'Колоссянам', ko: '골로새서' },
        abbrev: { en: 'Col', 'pt-br': 'Cl', es: 'Col', fr: 'Col', de: 'Kol', it: 'Col', zh: '西', ru: 'Кол', ko: '골' }
    },
    {
        id: 52,
        chapters: 5,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: '1-thessalonians', 'pt-br': '1-tessalonicenses', es: '1-tesalonicenses', fr: '1-thessaloniciens', de: '1-thessalonicher', it: '1-tessalonicesi', zh: '帖撒罗尼迦前书', ru: '1-фессалоникийцам', ko: '데살로니가전서' },
        names: { en: '1 Thessalonians', 'pt-br': '1 Tessalonicenses', es: '1 Tesalonicenses', fr: '1 Thessaloniciens', de: '1 Thessalonicher', it: '1 Tessalonicesi', zh: '帖撒罗尼迦前书', ru: '1 Фессалоникийцам', ko: '데살로니가전서' },
        abbrev: { en: '1Th', 'pt-br': '1Ts', es: '1Ts', fr: '1Th', de: '1Thess', it: '1Tes', zh: '帖前', ru: '1Фес', ko: '살전' }
    },
    {
        id: 53,
        chapters: 3,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: '2-thessalonians', 'pt-br': '2-tessalonicenses', es: '2-tesalonicenses', fr: '2-thessaloniciens', de: '2-thessalonicher', it: '2-tessalonicesi', zh: '帖撒罗尼迦后书', ru: '2-фессалоникийцам', ko: '데살로니가후서' },
        names: { en: '2 Thessalonians', 'pt-br': '2 Tessalonicenses', es: '2 Tesalonicenses', fr: '2 Thessaloniciens', de: '2 Thessalonicher', it: '2 Tessalonicesi', zh: '帖撒罗尼迦后书', ru: '2 Фессалоникийцам', ko: '데살로니가후서' },
        abbrev: { en: '2Th', 'pt-br': '2Ts', es: '2Ts', fr: '2Th', de: '2Thess', it: '2Tes', zh: '帖后', ru: '2Фес', ko: '살후' }
    },
    {
        id: 54,
        chapters: 6,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: '1-timothy', 'pt-br': '1-timoteo', es: '1-timoteo', fr: '1-timothee', de: '1-timotheus', it: '1-timoteo', zh: '提摩太前书', ru: '1-тимофею', ko: '디모데전서' },
        names: { en: '1 Timothy', 'pt-br': '1 Timóteo', es: '1 Timoteo', fr: '1 Timothée', de: '1 Timotheus', it: '1 Timoteo', zh: '提摩太前书', ru: '1 Тимофею', ko: '디모데전서' },
        abbrev: { en: '1Ti', 'pt-br': '1Tm', es: '1Ti', fr: '1Tm', de: '1Tim', it: '1Tm', zh: '提前', ru: '1Тим', ko: '딤전' }
    },
    {
        id: 55,
        chapters: 4,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: '2-timothy', 'pt-br': '2-timoteo', es: '2-timoteo', fr: '2-timothee', de: '2-timotheus', it: '2-timoteo', zh: '提摩太后书', ru: '2-тимофею', ko: '디모데후서' },
        names: { en: '2 Timothy', 'pt-br': '2 Timóteo', es: '2 Timoteo', fr: '2 Timothée', de: '2 Timotheus', it: '2 Timoteo', zh: '提摩太后书', ru: '2 Тимофею', ko: '디모데후서' },
        abbrev: { en: '2Ti', 'pt-br': '2Tm', es: '2Ti', fr: '2Tm', de: '2Tim', it: '2Tm', zh: '提后', ru: '2Тим', ko: '딤후' }
    },
    {
        id: 56,
        chapters: 3,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'titus', 'pt-br': 'tito', es: 'tito', fr: 'tite', de: 'titus', it: 'tito', zh: '提多书', ru: 'титу', ko: '디도서' },
        names: { en: 'Titus', 'pt-br': 'Tito', es: 'Tito', fr: 'Tite', de: 'Titus', it: 'Tito', zh: '提多书', ru: 'Титу', ko: '디도서' },
        abbrev: { en: 'Tit', 'pt-br': 'Tt', es: 'Tit', fr: 'Tt', de: 'Tit', it: 'Tt', zh: '多', ru: 'Тит', ko: '딛' }
    },
    {
        id: 57,
        chapters: 1,
        testament: 'new',
        category: 'pauline-epistles',
        slugs: { en: 'philemon', 'pt-br': 'filemom', es: 'filemon', fr: 'philemon', de: 'philemon', it: 'filemone', zh: '腓利门书', ru: 'филимону', ko: '빌레몬서' },
        names: { en: 'Philemon', 'pt-br': 'Filemom', es: 'Filemón', fr: 'Philémon', de: 'Philemon', it: 'Filemone', zh: '腓利门书', ru: 'Филимону', ko: '빌레몬서' },
        abbrev: { en: 'Phm', 'pt-br': 'Fm', es: 'Flm', fr: 'Phm', de: 'Phlm', it: 'Fm', zh: '门', ru: 'Флм', ko: '몬' }
    },
    {
        id: 58,
        chapters: 13,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: 'hebrews', 'pt-br': 'hebreus', es: 'hebreos', fr: 'hebreux', de: 'hebraeer', it: 'ebrei', zh: '希伯来书', ru: 'евреям', ko: '히브리서' },
        names: { en: 'Hebrews', 'pt-br': 'Hebreus', es: 'Hebreos', fr: 'Hébreux', de: 'Hebräer', it: 'Ebrei', zh: '希伯来书', ru: 'Евреям', ko: '히브리서' },
        abbrev: { en: 'Heb', 'pt-br': 'Hb', es: 'He', fr: 'Hé', de: 'Hebr', it: 'Eb', zh: '来', ru: 'Евр', ko: '히' }
    },
    {
        id: 59,
        chapters: 5,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: 'james', 'pt-br': 'tiago', es: 'santiago', fr: 'jacques', de: 'jakobus', it: 'giacomo', zh: '雅各书', ru: 'иаков', ko: '야고보서' },
        names: { en: 'James', 'pt-br': 'Tiago', es: 'Santiago', fr: 'Jacques', de: 'Jakobus', it: 'Giacomo', zh: '雅各书', ru: 'Иаков', ko: '야고보서' },
        abbrev: { en: 'Jam', 'pt-br': 'Tg', es: 'Stg', fr: 'Jc', de: 'Jak', it: 'Gc', zh: '雅', ru: 'Иак', ko: '약' }
    },
    {
        id: 60,
        chapters: 5,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: '1-peter', 'pt-br': '1-pedro', es: '1-pedro', fr: '1-pierre', de: '1-petrus', it: '1-pietro', zh: '彼得前书', ru: '1-петра', ko: '베드로전서' },
        names: { en: '1 Peter', 'pt-br': '1 Pedro', es: '1 Pedro', fr: '1 Pierre', de: '1 Petrus', it: '1 Pietro', zh: '彼得前书', ru: '1 Петра', ko: '베드로전서' },
        abbrev: { en: '1Pe', 'pt-br': '1Pe', es: '1Pe', fr: '1P', de: '1Petr', it: '1Pt', zh: '彼前', ru: '1Пет', ko: '벧전' }
    },
    {
        id: 61,
        chapters: 3,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: '2-peter', 'pt-br': '2-pedro', es: '2-pedro', fr: '2-pierre', de: '2-petrus', it: '2-pietro', zh: '彼得后书', ru: '2-петра', ko: '베드로후서' },
        names: { en: '2 Peter', 'pt-br': '2 Pedro', es: '2 Pedro', fr: '2 Pierre', de: '2 Petrus', it: '2 Pietro', zh: '彼得后书', ru: '2 Петра', ko: '베드로후서' },
        abbrev: { en: '2Pe', 'pt-br': '2Pe', es: '2Pe', fr: '2P', de: '2Petr', it: '2Pt', zh: '彼后', ru: '2Пет', ko: '벧후' }
    },
    {
        id: 62,
        chapters: 5,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: '1-john', 'pt-br': '1-joao', es: '1-juan', fr: '1-jean', de: '1-johannes', it: '1-giovanni', zh: '约翰一书', ru: '1-иоанна', ko: '요한1서' },
        names: { en: '1 John', 'pt-br': '1 João', es: '1 Juan', fr: '1 Jean', de: '1 Johannes', it: '1 Giovanni', zh: '约翰一书', ru: '1 Иоанна', ko: '요한1서' },
        abbrev: { en: '1Jo', 'pt-br': '1Jo', es: '1Jn', fr: '1Jn', de: '1Joh', it: '1Gv', zh: '约一', ru: '1Ин', ko: '요일' }
    },
    {
        id: 63,
        chapters: 1,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: '2-john', 'pt-br': '2-joao', es: '2-juan', fr: '2-jean', de: '2-johannes', it: '2-giovanni', zh: '约翰二书', ru: '2-иоанна', ko: '요한2서' },
        names: { en: '2 John', 'pt-br': '2 João', es: '2 Juan', fr: '2 Jean', de: '2 Johannes', it: '2 Giovanni', zh: '约翰二书', ru: '2 Иоанна', ko: '요한2서' },
        abbrev: { en: '2Jo', 'pt-br': '2Jo', es: '2Jn', fr: '2Jn', de: '2Joh', it: '2Gv', zh: '约二', ru: '2Ин', ko: '요이' }
    },
    {
        id: 64,
        chapters: 1,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: '3-john', 'pt-br': '3-joao', es: '3-juan', fr: '3-jean', de: '3-johannes', it: '3-giovanni', zh: '约翰三书', ru: '3-иоанна', ko: '요한3서' },
        names: { en: '3 John', 'pt-br': '3 João', es: '3 Juan', fr: '3 Jean', de: '3 Johannes', it: '3 Giovanni', zh: '约翰三书', ru: '3 Иоанна', ko: '요한3서' },
        abbrev: { en: '3Jo', 'pt-br': '3Jo', es: '3Jn', fr: '3Jn', de: '3Joh', it: '3Gv', zh: '约三', ru: '3Ин', ko: '요삼' }
    },
    {
        id: 65,
        chapters: 1,
        testament: 'new',
        category: 'general-epistles',
        slugs: { en: 'jude', 'pt-br': 'judas', es: 'judas', fr: 'jude', de: 'judas', it: 'giuda', zh: '犹大书', ru: 'иуда', ko: '유다서' },
        names: { en: 'Jude', 'pt-br': 'Judas', es: 'Judas', fr: 'Jude', de: 'Judas', it: 'Giuda', zh: '犹大书', ru: 'Иуда', ko: '유다서' },
        abbrev: { en: 'Jud', 'pt-br': 'Jd', es: 'Jud', fr: 'Jude', de: 'Jud', it: 'Gd', zh: '犹', ru: 'Иуд', ko: '유' }
    },
    {
        id: 66,
        chapters: 22,
        testament: 'new',
        category: 'prophecy',
        slugs: { en: 'revelation', 'pt-br': 'apocalipse', es: 'apocalipsis', fr: 'apocalypse', de: 'offenbarung', it: 'apocalisse', zh: '启示录', ru: 'откровение', ko: '요한계시록' },
        names: { en: 'Revelation', 'pt-br': 'Apocalipse', es: 'Apocalipsis', fr: 'Apocalypse', de: 'Offenbarung', it: 'Apocalisse', zh: '启示录', ru: 'Откровение', ko: '요한계시록' },
        abbrev: { en: 'Rev', 'pt-br': 'Ap', es: 'Ap', fr: 'Ap', de: 'Offb', it: 'Ap', zh: '启', ru: 'Откр', ko: '계' }
    }
];
