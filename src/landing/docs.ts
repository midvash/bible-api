/**
 * Conteúdo i18n das seções de documentação aprofundada da landing
 * (formato/cache, erros, livros, guias de uso). Separado de `i18n.ts` para
 * manter aquele arquivo focado nas strings de marketing/SEO.
 *
 * Partes invariáveis (JSON de exemplo, nomes de header, snippets cURL/JS/Python,
 * códigos de erro) vivem em `page.ts` — aqui só as strings traduzíveis.
 */

import type { Locale } from './i18n';

export interface HttpRow {
  k: string;
  v: string;
}

export interface DocsStrings {
  format: {
    title: string;
    subtitle: string;
    envelopeTitle: string;
    envelopeDesc: string;
    httpTitle: string;
    httpRows: HttpRow[];
    votdNoteTitle: string;
    votdNote: string;
  };
  errors: {
    title: string;
    subtitle: string;
    shapeNote: string;
    colCode: string;
    colStatus: string;
    colWhen: string;
    when: {
      INVALID_PARAMS: string;
      NOT_FOUND: string;
      VERSION_NOT_FOUND: string;
      BOOK_NOT_FOUND: string;
      CHAPTER_NOT_FOUND: string;
      VERSE_NOT_FOUND: string;
      INTERNAL_ERROR: string;
    };
  };
  books: {
    title: string;
    subtitle: string;
    oldTestament: string;
    newTestament: string;
    chaptersAbbr: string;
  };
  guides: {
    title: string;
    subtitle: string;
    ex1: string;
    ex2: string;
    ex3: string;
  };
}

export const DOCS_STRINGS: Record<Locale, DocsStrings> = {
  en: {
    format: {
      title: "Response format & caching",
      subtitle: "Every v1 endpoint speaks the same JSON envelope and the same HTTP cache rules.",
      envelopeTitle: "Success envelope",
      envelopeDesc: "Successful responses wrap the payload in a top-level data field. List and content endpoints add an optional meta object — totals, the resolved reference, and so on.",
      httpTitle: "HTTP & caching",
      httpRows: [
        { k: "Caching", v: "Content is immutable — cached for one year (max-age=31536000, immutable). New content ships under a new URL, never a changed body." },
        { k: "Revalidation", v: "Every response carries a strong ETag. Send If-None-Match and you get 304 Not Modified with no body." },
        { k: "CORS", v: "Open to every origin (Access-Control-Allow-Origin: *). Call it straight from the browser — no proxy." },
        { k: "Methods", v: "GET, HEAD and OPTIONS. HEAD returns headers only; OPTIONS handles the CORS preflight." },
      ],
      votdNoteTitle: "One exception — /v1/votd",
      votdNote: "The verse of the day returns a flat object (reference, text, version, book_slug, chapter, verse_start, verse_end, url) instead of the data/meta envelope, and is cached for 24 hours.",
    },
    errors: {
      title: "Errors",
      subtitle: "Every error uses one shape and a stable, machine-readable code.",
      shapeNote: "4xx responses are cached for 60 seconds; 5xx are never cached, so retries always reach the origin.",
      colCode: "Code",
      colStatus: "HTTP",
      colWhen: "When it happens",
      when: {
        INVALID_PARAMS: "A path or query value is malformed — e.g. a chapter number out of range.",
        NOT_FOUND: "The route doesn't exist under /v1.",
        VERSION_NOT_FOUND: "No version matches the given slug.",
        BOOK_NOT_FOUND: "No book matches the given slug, in any language.",
        CHAPTER_NOT_FOUND: "That chapter isn't available in this version.",
        VERSE_NOT_FOUND: "The verse or range falls outside the chapter.",
        INTERNAL_ERROR: "Something failed on our side — safe to retry.",
      },
    },
    books: {
      title: "The 66 books",
      subtitle: "Slugs work in any language. Click a book to fetch its metadata.",
      oldTestament: "Old Testament",
      newTestament: "New Testament",
      chaptersAbbr: "ch.",
    },
    guides: {
      title: "Copy-paste guides",
      subtitle: "The same request, in the tools you already use.",
      ex1: "Fetch a single verse",
      ex2: "List versions in one language",
      ex3: "Verse of the day",
    },
  },

  "pt-br": {
    format: {
      title: "Formato de resposta e cache",
      subtitle: "Todo endpoint v1 fala o mesmo envelope JSON e as mesmas regras de cache HTTP.",
      envelopeTitle: "Envelope de sucesso",
      envelopeDesc: "Respostas de sucesso envolvem o payload num campo data no topo. Endpoints de listagem e de conteúdo adicionam um objeto meta opcional — totais, a referência resolvida e afins.",
      httpTitle: "HTTP e cache",
      httpRows: [
        { k: "Cache", v: "O conteúdo é imutável — cacheado por um ano (max-age=31536000, immutable). Conteúdo novo entra numa URL nova, nunca num corpo alterado." },
        { k: "Revalidação", v: "Toda resposta carrega um ETag forte. Mande If-None-Match e recebe 304 Not Modified sem corpo." },
        { k: "CORS", v: "Aberta a qualquer origem (Access-Control-Allow-Origin: *). Chame direto do navegador — sem proxy." },
        { k: "Métodos", v: "GET, HEAD e OPTIONS. HEAD retorna só os headers; OPTIONS trata o preflight de CORS." },
      ],
      votdNoteTitle: "Uma exceção — /v1/votd",
      votdNote: "O versículo do dia retorna um objeto flat (reference, text, version, book_slug, chapter, verse_start, verse_end, url) em vez do envelope data/meta, e é cacheado por 24 horas.",
    },
    errors: {
      title: "Erros",
      subtitle: "Todo erro usa um único formato e um código estável, legível por máquina.",
      shapeNote: "Respostas 4xx são cacheadas por 60 segundos; 5xx nunca são cacheadas, então o retry sempre chega na origem.",
      colCode: "Código",
      colStatus: "HTTP",
      colWhen: "Quando acontece",
      when: {
        INVALID_PARAMS: "Um valor de path ou query está malformado — ex.: número de capítulo fora do intervalo.",
        NOT_FOUND: "A rota não existe sob /v1.",
        VERSION_NOT_FOUND: "Nenhuma versão corresponde ao slug informado.",
        BOOK_NOT_FOUND: "Nenhum livro corresponde ao slug, em qualquer idioma.",
        CHAPTER_NOT_FOUND: "Esse capítulo não está disponível nesta versão.",
        VERSE_NOT_FOUND: "O versículo ou intervalo está fora do capítulo.",
        INTERNAL_ERROR: "Algo falhou do nosso lado — seguro tentar de novo.",
      },
    },
    books: {
      title: "Os 66 livros",
      subtitle: "Os slugs funcionam em qualquer idioma. Clique num livro para ver seus metadados.",
      oldTestament: "Antigo Testamento",
      newTestament: "Novo Testamento",
      chaptersAbbr: "cap.",
    },
    guides: {
      title: "Guias copia-e-cola",
      subtitle: "A mesma requisição, nas ferramentas que você já usa.",
      ex1: "Pegar um único versículo",
      ex2: "Listar versões de um idioma",
      ex3: "Versículo do dia",
    },
  },

  es: {
    format: {
      title: "Formato de respuesta y caché",
      subtitle: "Cada endpoint v1 habla el mismo envoltorio JSON y las mismas reglas de caché HTTP.",
      envelopeTitle: "Envoltorio de éxito",
      envelopeDesc: "Las respuestas correctas envuelven el payload en un campo data de nivel superior. Los endpoints de listas y de contenido añaden un objeto meta opcional — totales, la referencia resuelta, etc.",
      httpTitle: "HTTP y caché",
      httpRows: [
        { k: "Caché", v: "El contenido es inmutable — en caché un año (max-age=31536000, immutable). El contenido nuevo llega en una URL nueva, nunca en un cuerpo modificado." },
        { k: "Revalidación", v: "Cada respuesta lleva un ETag fuerte. Envía If-None-Match y recibes 304 Not Modified sin cuerpo." },
        { k: "CORS", v: "Abierta a cualquier origen (Access-Control-Allow-Origin: *). Llámala directo desde el navegador — sin proxy." },
        { k: "Métodos", v: "GET, HEAD y OPTIONS. HEAD devuelve solo las cabeceras; OPTIONS gestiona el preflight de CORS." },
      ],
      votdNoteTitle: "Una excepción — /v1/votd",
      votdNote: "El versículo del día devuelve un objeto plano (reference, text, version, book_slug, chapter, verse_start, verse_end, url) en lugar del envoltorio data/meta, y se cachea 24 horas.",
    },
    errors: {
      title: "Errores",
      subtitle: "Cada error usa un único formato y un código estable, legible por máquina.",
      shapeNote: "Las respuestas 4xx se cachean 60 segundos; las 5xx nunca se cachean, así el reintento siempre llega al origen.",
      colCode: "Código",
      colStatus: "HTTP",
      colWhen: "Cuándo ocurre",
      when: {
        INVALID_PARAMS: "Un valor de ruta o query está mal formado — p. ej. un número de capítulo fuera de rango.",
        NOT_FOUND: "La ruta no existe bajo /v1.",
        VERSION_NOT_FOUND: "Ninguna versión coincide con el slug dado.",
        BOOK_NOT_FOUND: "Ningún libro coincide con el slug, en ningún idioma.",
        CHAPTER_NOT_FOUND: "Ese capítulo no está disponible en esta versión.",
        VERSE_NOT_FOUND: "El versículo o rango queda fuera del capítulo.",
        INTERNAL_ERROR: "Algo falló de nuestro lado — seguro reintentar.",
      },
    },
    books: {
      title: "Los 66 libros",
      subtitle: "Los slugs funcionan en cualquier idioma. Haz clic en un libro para ver sus metadatos.",
      oldTestament: "Antiguo Testamento",
      newTestament: "Nuevo Testamento",
      chaptersAbbr: "cap.",
    },
    guides: {
      title: "Guías para copiar y pegar",
      subtitle: "La misma petición, en las herramientas que ya usas.",
      ex1: "Obtener un versículo",
      ex2: "Listar versiones de un idioma",
      ex3: "Versículo del día",
    },
  },

  fr: {
    format: {
      title: "Format de réponse et cache",
      subtitle: "Chaque endpoint v1 parle le même enveloppe JSON et les mêmes règles de cache HTTP.",
      envelopeTitle: "Enveloppe de succès",
      envelopeDesc: "Les réponses réussies encapsulent la charge utile dans un champ data de premier niveau. Les endpoints de listes et de contenu ajoutent un objet meta optionnel — totaux, référence résolue, etc.",
      httpTitle: "HTTP et cache",
      httpRows: [
        { k: "Cache", v: "Le contenu est immuable — mis en cache un an (max-age=31536000, immutable). Le nouveau contenu arrive sous une nouvelle URL, jamais dans un corps modifié." },
        { k: "Revalidation", v: "Chaque réponse porte un ETag fort. Envoyez If-None-Match et vous obtenez 304 Not Modified sans corps." },
        { k: "CORS", v: "Ouverte à toute origine (Access-Control-Allow-Origin: *). Appelez-la directement depuis le navigateur — sans proxy." },
        { k: "Méthodes", v: "GET, HEAD et OPTIONS. HEAD ne renvoie que les en-têtes ; OPTIONS gère le preflight CORS." },
      ],
      votdNoteTitle: "Une exception — /v1/votd",
      votdNote: "Le verset du jour renvoie un objet plat (reference, text, version, book_slug, chapter, verse_start, verse_end, url) au lieu de l enveloppe data/meta, et est mis en cache 24 heures.",
    },
    errors: {
      title: "Erreurs",
      subtitle: "Chaque erreur utilise un seul format et un code stable, lisible par machine.",
      shapeNote: "Les réponses 4xx sont mises en cache 60 secondes ; les 5xx ne le sont jamais, donc les retries atteignent toujours l origine.",
      colCode: "Code",
      colStatus: "HTTP",
      colWhen: "Quand ça arrive",
      when: {
        INVALID_PARAMS: "Une valeur de chemin ou de requête est mal formée — ex. un numéro de chapitre hors limites.",
        NOT_FOUND: "La route n existe pas sous /v1.",
        VERSION_NOT_FOUND: "Aucune version ne correspond au slug donné.",
        BOOK_NOT_FOUND: "Aucun livre ne correspond au slug, dans aucune langue.",
        CHAPTER_NOT_FOUND: "Ce chapitre n est pas disponible dans cette version.",
        VERSE_NOT_FOUND: "Le verset ou la plage est hors du chapitre.",
        INTERNAL_ERROR: "Une erreur de notre côté — réessayer sans risque.",
      },
    },
    books: {
      title: "Les 66 livres",
      subtitle: "Les slugs fonctionnent dans toutes les langues. Cliquez sur un livre pour ses métadonnées.",
      oldTestament: "Ancien Testament",
      newTestament: "Nouveau Testament",
      chaptersAbbr: "ch.",
    },
    guides: {
      title: "Guides à copier-coller",
      subtitle: "La même requête, dans les outils que vous utilisez déjà.",
      ex1: "Récupérer un verset",
      ex2: "Lister les versions d une langue",
      ex3: "Verset du jour",
    },
  },

  de: {
    format: {
      title: "Antwortformat & Caching",
      subtitle: "Jeder v1-Endpoint spricht dasselbe JSON-Envelope und dieselben HTTP-Cache-Regeln.",
      envelopeTitle: "Erfolgs-Envelope",
      envelopeDesc: "Erfolgreiche Antworten verpacken die Nutzlast in ein data-Feld auf oberster Ebene. Listen- und Inhalts-Endpoints ergänzen ein optionales meta-Objekt — Summen, die aufgelöste Referenz und so weiter.",
      httpTitle: "HTTP & Caching",
      httpRows: [
        { k: "Caching", v: "Inhalte sind unveränderlich — ein Jahr gecacht (max-age=31536000, immutable). Neue Inhalte kommen unter einer neuen URL, nie in einem geänderten Body." },
        { k: "Revalidierung", v: "Jede Antwort trägt ein starkes ETag. Sende If-None-Match und du bekommst 304 Not Modified ohne Body." },
        { k: "CORS", v: "Für jede Origin offen (Access-Control-Allow-Origin: *). Rufe sie direkt aus dem Browser auf — ohne Proxy." },
        { k: "Methoden", v: "GET, HEAD und OPTIONS. HEAD liefert nur die Header; OPTIONS behandelt den CORS-Preflight." },
      ],
      votdNoteTitle: "Eine Ausnahme — /v1/votd",
      votdNote: "Der Vers des Tages liefert ein flaches Objekt (reference, text, version, book_slug, chapter, verse_start, verse_end, url) statt des data/meta-Envelopes und wird 24 Stunden gecacht.",
    },
    errors: {
      title: "Fehler",
      subtitle: "Jeder Fehler nutzt ein Format und einen stabilen, maschinenlesbaren Code.",
      shapeNote: "4xx-Antworten werden 60 Sekunden gecacht; 5xx nie, damit Retries immer den Origin erreichen.",
      colCode: "Code",
      colStatus: "HTTP",
      colWhen: "Wann es passiert",
      when: {
        INVALID_PARAMS: "Ein Pfad- oder Query-Wert ist ungültig — z. B. eine Kapitelnummer außerhalb des Bereichs.",
        NOT_FOUND: "Die Route existiert unter /v1 nicht.",
        VERSION_NOT_FOUND: "Keine Übersetzung passt zum angegebenen Slug.",
        BOOK_NOT_FOUND: "Kein Buch passt zum Slug, in keiner Sprache.",
        CHAPTER_NOT_FOUND: "Dieses Kapitel ist in dieser Übersetzung nicht verfügbar.",
        VERSE_NOT_FOUND: "Der Vers oder Bereich liegt außerhalb des Kapitels.",
        INTERNAL_ERROR: "Auf unserer Seite ist etwas schiefgegangen — Retry ist sicher.",
      },
    },
    books: {
      title: "Die 66 Bücher",
      subtitle: "Slugs funktionieren in jeder Sprache. Klicke ein Buch für seine Metadaten.",
      oldTestament: "Altes Testament",
      newTestament: "Neues Testament",
      chaptersAbbr: "Kap.",
    },
    guides: {
      title: "Copy-paste-Guides",
      subtitle: "Dieselbe Anfrage, in den Tools, die du schon nutzt.",
      ex1: "Einen Vers holen",
      ex2: "Übersetzungen einer Sprache listen",
      ex3: "Vers des Tages",
    },
  },

  it: {
    format: {
      title: "Formato di risposta e cache",
      subtitle: "Ogni endpoint v1 parla lo stesso involucro JSON e le stesse regole di cache HTTP.",
      envelopeTitle: "Involucro di successo",
      envelopeDesc: "Le risposte riuscite avvolgono il payload in un campo data di primo livello. Gli endpoint di elenco e contenuto aggiungono un oggetto meta opzionale — totali, il riferimento risolto e così via.",
      httpTitle: "HTTP e cache",
      httpRows: [
        { k: "Cache", v: "Il contenuto è immutabile — in cache per un anno (max-age=31536000, immutable). I nuovi contenuti arrivano con un nuovo URL, mai con un corpo modificato." },
        { k: "Rivalidazione", v: "Ogni risposta porta un ETag forte. Invia If-None-Match e ottieni 304 Not Modified senza corpo." },
        { k: "CORS", v: "Aperta a qualsiasi origine (Access-Control-Allow-Origin: *). Chiamala direttamente dal browser — senza proxy." },
        { k: "Metodi", v: "GET, HEAD e OPTIONS. HEAD restituisce solo gli header; OPTIONS gestisce il preflight CORS." },
      ],
      votdNoteTitle: "Un eccezione — /v1/votd",
      votdNote: "Il versetto del giorno restituisce un oggetto piatto (reference, text, version, book_slug, chapter, verse_start, verse_end, url) invece dell involucro data/meta, ed è in cache per 24 ore.",
    },
    errors: {
      title: "Errori",
      subtitle: "Ogni errore usa un solo formato e un codice stabile, leggibile dalle macchine.",
      shapeNote: "Le risposte 4xx sono in cache per 60 secondi; le 5xx non lo sono mai, così i retry raggiungono sempre l origine.",
      colCode: "Codice",
      colStatus: "HTTP",
      colWhen: "Quando accade",
      when: {
        INVALID_PARAMS: "Un valore di path o query è malformato — es. un numero di capitolo fuori intervallo.",
        NOT_FOUND: "La rotta non esiste sotto /v1.",
        VERSION_NOT_FOUND: "Nessuna versione corrisponde allo slug indicato.",
        BOOK_NOT_FOUND: "Nessun libro corrisponde allo slug, in nessuna lingua.",
        CHAPTER_NOT_FOUND: "Quel capitolo non è disponibile in questa versione.",
        VERSE_NOT_FOUND: "Il versetto o l intervallo è fuori dal capitolo.",
        INTERNAL_ERROR: "Qualcosa è andato storto dalla nostra parte — riprovare è sicuro.",
      },
    },
    books: {
      title: "I 66 libri",
      subtitle: "Gli slug funzionano in qualsiasi lingua. Clicca un libro per i suoi metadati.",
      oldTestament: "Antico Testamento",
      newTestament: "Nuovo Testamento",
      chaptersAbbr: "cap.",
    },
    guides: {
      title: "Guide copia-e-incolla",
      subtitle: "La stessa richiesta, negli strumenti che già usi.",
      ex1: "Ottenere un versetto",
      ex2: "Elencare le versioni di una lingua",
      ex3: "Versetto del giorno",
    },
  },

  zh: {
    format: {
      title: "响应格式与缓存",
      subtitle: "每个 v1 接口都使用相同的 JSON 外壳和相同的 HTTP 缓存规则。",
      envelopeTitle: "成功外壳",
      envelopeDesc: "成功响应将载荷包装在顶层的 data 字段中。列表和内容接口会附加一个可选的 meta 对象 —— 总数、解析后的引用等。",
      httpTitle: "HTTP 与缓存",
      httpRows: [
        { k: "缓存", v: "内容不可变 —— 缓存一年（max-age=31536000, immutable）。新内容使用新的 URL，绝不修改响应体。" },
        { k: "重新验证", v: "每个响应都带有强 ETag。发送 If-None-Match 即可获得 304 Not Modified（无响应体）。" },
        { k: "CORS", v: "对所有来源开放（Access-Control-Allow-Origin: *）。可直接从浏览器调用，无需代理。" },
        { k: "方法", v: "GET、HEAD 和 OPTIONS。HEAD 仅返回响应头；OPTIONS 处理 CORS 预检。" },
      ],
      votdNoteTitle: "一个例外 —— /v1/votd",
      votdNote: "每日经文返回一个扁平对象（reference, text, version, book_slug, chapter, verse_start, verse_end, url），而非 data/meta 外壳，并缓存 24 小时。",
    },
    errors: {
      title: "错误",
      subtitle: "每个错误都使用统一格式和稳定、可被机器读取的代码。",
      shapeNote: "4xx 响应缓存 60 秒；5xx 从不缓存，因此重试总能到达源站。",
      colCode: "代码",
      colStatus: "HTTP",
      colWhen: "何时发生",
      when: {
        INVALID_PARAMS: "路径或查询值格式不正确 —— 例如章节号超出范围。",
        NOT_FOUND: "该路由在 /v1 下不存在。",
        VERSION_NOT_FOUND: "没有版本匹配给定的 slug。",
        BOOK_NOT_FOUND: "没有书卷匹配该 slug（任意语言）。",
        CHAPTER_NOT_FOUND: "该章节在此版本中不可用。",
        VERSE_NOT_FOUND: "经文或区间超出该章范围。",
        INTERNAL_ERROR: "我方出现故障 —— 可安全重试。",
      },
    },
    books: {
      title: "全部 66 卷书",
      subtitle: "slug 支持任意语言。点击书卷查看其元数据。",
      oldTestament: "旧约",
      newTestament: "新约",
      chaptersAbbr: "章",
    },
    guides: {
      title: "复制即用指南",
      subtitle: "同一个请求，用你已经在用的工具。",
      ex1: "获取单节经文",
      ex2: "列出某语言的版本",
      ex3: "每日经文",
    },
  },

  ru: {
    format: {
      title: "Формат ответа и кэширование",
      subtitle: "Каждый эндпоинт v1 говорит на одном JSON-конверте и по одним правилам HTTP-кэша.",
      envelopeTitle: "Конверт успеха",
      envelopeDesc: "Успешные ответы оборачивают полезную нагрузку в поле data верхнего уровня. Эндпоинты списков и контента добавляют необязательный объект meta — итоги, разрешённая ссылка и т. д.",
      httpTitle: "HTTP и кэш",
      httpRows: [
        { k: "Кэширование", v: "Контент неизменяемый — кэшируется на год (max-age=31536000, immutable). Новый контент приходит по новому URL, а не в изменённом теле." },
        { k: "Ревалидация", v: "Каждый ответ несёт сильный ETag. Отправьте If-None-Match и получите 304 Not Modified без тела." },
        { k: "CORS", v: "Открыт для любого источника (Access-Control-Allow-Origin: *). Вызывайте прямо из браузера — без прокси." },
        { k: "Методы", v: "GET, HEAD и OPTIONS. HEAD возвращает только заголовки; OPTIONS обрабатывает CORS preflight." },
      ],
      votdNoteTitle: "Одно исключение — /v1/votd",
      votdNote: "Стих дня возвращает плоский объект (reference, text, version, book_slug, chapter, verse_start, verse_end, url) вместо конверта data/meta и кэшируется на 24 часа.",
    },
    errors: {
      title: "Ошибки",
      subtitle: "Каждая ошибка использует один формат и стабильный машиночитаемый код.",
      shapeNote: "Ответы 4xx кэшируются на 60 секунд; 5xx не кэшируются никогда, чтобы повторы всегда доходили до источника.",
      colCode: "Код",
      colStatus: "HTTP",
      colWhen: "Когда возникает",
      when: {
        INVALID_PARAMS: "Значение пути или запроса некорректно — например, номер главы вне диапазона.",
        NOT_FOUND: "Маршрут не существует под /v1.",
        VERSION_NOT_FOUND: "Ни один перевод не соответствует указанному slug.",
        BOOK_NOT_FOUND: "Ни одна книга не соответствует slug, ни на одном языке.",
        CHAPTER_NOT_FOUND: "Этой главы нет в этом переводе.",
        VERSE_NOT_FOUND: "Стих или диапазон вне главы.",
        INTERNAL_ERROR: "Что-то сломалось на нашей стороне — повтор безопасен.",
      },
    },
    books: {
      title: "66 книг",
      subtitle: "Slug работают на любом языке. Нажмите книгу, чтобы получить метаданные.",
      oldTestament: "Ветхий Завет",
      newTestament: "Новый Завет",
      chaptersAbbr: "гл.",
    },
    guides: {
      title: "Руководства «копировать-вставить»",
      subtitle: "Один и тот же запрос — в инструментах, которыми вы уже пользуетесь.",
      ex1: "Получить один стих",
      ex2: "Список переводов одного языка",
      ex3: "Стих дня",
    },
  },

  ko: {
    format: {
      title: "응답 형식과 캐싱",
      subtitle: "모든 v1 엔드포인트는 같은 JSON 봉투와 같은 HTTP 캐시 규칙을 사용합니다.",
      envelopeTitle: "성공 봉투",
      envelopeDesc: "성공 응답은 페이로드를 최상위 data 필드로 감쌉니다. 목록과 본문 엔드포인트는 선택적 meta 객체 — 총계, 해석된 참조 등 — 를 추가합니다.",
      httpTitle: "HTTP와 캐싱",
      httpRows: [
        { k: "캐싱", v: "콘텐츠는 불변입니다 — 1년 동안 캐시됩니다(max-age=31536000, immutable). 새 콘텐츠는 본문을 바꾸지 않고 새 URL로 제공됩니다." },
        { k: "재검증", v: "모든 응답에 강한 ETag가 있습니다. If-None-Match를 보내면 본문 없이 304 Not Modified를 받습니다." },
        { k: "CORS", v: "모든 오리진에 열려 있습니다(Access-Control-Allow-Origin: *). 프록시 없이 브라우저에서 바로 호출하세요." },
        { k: "메서드", v: "GET, HEAD, OPTIONS. HEAD는 헤더만 반환하고 OPTIONS는 CORS 프리플라이트를 처리합니다." },
      ],
      votdNoteTitle: "예외 하나 — /v1/votd",
      votdNote: "오늘의 말씀은 data/meta 봉투 대신 평면 객체(reference, text, version, book_slug, chapter, verse_start, verse_end, url)를 반환하며 24시간 캐시됩니다.",
    },
    errors: {
      title: "오류",
      subtitle: "모든 오류는 하나의 형식과 안정적이고 기계가 읽을 수 있는 코드를 사용합니다.",
      shapeNote: "4xx 응답은 60초간 캐시되고, 5xx는 절대 캐시되지 않아 재시도가 항상 오리진에 도달합니다.",
      colCode: "코드",
      colStatus: "HTTP",
      colWhen: "발생 상황",
      when: {
        INVALID_PARAMS: "경로 또는 쿼리 값이 잘못되었습니다 — 예: 범위를 벗어난 장 번호.",
        NOT_FOUND: "해당 경로가 /v1 아래에 없습니다.",
        VERSION_NOT_FOUND: "주어진 slug와 일치하는 번역본이 없습니다.",
        BOOK_NOT_FOUND: "어떤 언어로도 slug와 일치하는 책이 없습니다.",
        CHAPTER_NOT_FOUND: "이 번역본에는 해당 장이 없습니다.",
        VERSE_NOT_FOUND: "절 또는 범위가 장을 벗어났습니다.",
        INTERNAL_ERROR: "우리 쪽에서 문제가 발생했습니다 — 재시도해도 안전합니다.",
      },
    },
    books: {
      title: "66권 전체",
      subtitle: "slug는 모든 언어에서 동작합니다. 책을 클릭하면 메타데이터를 가져옵니다.",
      oldTestament: "구약",
      newTestament: "신약",
      chaptersAbbr: "장",
    },
    guides: {
      title: "복사-붙여넣기 가이드",
      subtitle: "이미 쓰는 도구로 보내는 같은 요청.",
      ex1: "한 절 가져오기",
      ex2: "한 언어의 번역본 목록",
      ex3: "오늘의 말씀",
    },
  },
};
