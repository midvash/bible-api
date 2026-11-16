import { beforeEach, describe, expect, it } from 'vitest';
import { handleV1Chapter } from '../src/handlers/v1/chapters';
import { handleV1Passages } from '../src/handlers/v1/passages';
import { parsePreviewParam, previewOfChapter } from '../src/lib/chapter';
import { handleV1VersionDetail } from '../src/handlers/v1/versions';
import { handleV1Parse } from '../src/handlers/v1/parse';
import { lookupBook } from '../src/lib/book-lookup';
import type { Env } from '../src/env';

const PS = lookupBook('psalms').book!.id;

// 6 versos de 39 chars cada (sufixo vN indexa o verso).
const PSALM23 = Array.from({ length: 6 }, (_, i) => `${'x'.repeat(37)}v${i + 1}`);

const CATALOG = [
  {
    slug: 'kjv',
    name: 'King James Version',
    shortName: 'KJV',
    language: 'en',
    hasOldTestament: true,
    hasNewTestament: true,
    totalBooks: 66,
    totalChapters: 1189,
    copyright: 'King James Version (KJV)\nPublic Domain.',
  },
  {
    slug: 'nva',
    name: 'Nova Versão de Acesso Livre',
    shortName: 'NVA',
    language: 'pt-br',
    hasOldTestament: true,
    hasNewTestament: true,
    totalBooks: 66,
    totalChapters: 1189,
    copyright: 'NVA',
  },
];

const env = {
  R2_BUCKET: {
    async get(key: string) {
      if (key === 'catalog/versions.json') return { json: async () => CATALOG };
      // nvt saiu da API (sem licença) e aponta pra kjv; `fora` aponta pra
      // slug inexistente e tem que ser descartado.
      if (key === 'catalog/version-aliases.json') {
        return { json: async () => ({ nvt: 'kjv', fora: 'nao-existe' }) };
      }
      if (key === `kjv/${PS}/23.json` || key === `nva/${PS}/23.json`) return { text: async () => JSON.stringify(PSALM23) };
      return null;
    },
  },
} as unknown as Env;

let store = new Map<string, Response>();

function stubCaches() {
  store = new Map<string, Response>();
  (globalThis as Record<string, unknown>).caches = {
    default: {
      async match(key: Request) {
        const hit = store.get(key.url);
        return hit ? hit.clone() : undefined;
      },
      async put(key: Request, response: Response) {
        store.set(key.url, response);
      },
    },
  };
}

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext;

beforeEach(() => stubCaches());

async function json(res: Response) {
  return JSON.parse(await res.text());
}

function chapterRequest(query = '') {
  return new Request(`https://api.midvash.com/v1/kjv/psalms/23${query}`);
}

function callChapter(query = '') {
  return handleV1Chapter(chapterRequest(query), env, ctx, 'kjv', 'psalms', '23', undefined);
}

describe('GET /v1/{version}/{book}/{chapter} — shape espelha versículo', () => {
  it('capítulo inteiro traz text/verse/verseEnd além de verses[]', async () => {
    const res = await callChapter();
    const body = await json(res);
    expect(body.data).toMatchObject({
      version: 'kjv',
      book: 'psalms',
      chapter: 23,
      verse: 1,
      verseEnd: 6,
      text: PSALM23.join(' '),
    });
    expect(body.data.verses).toEqual(PSALM23);
    expect(body.meta).toMatchObject({ total: 6, reference: 'Psalms 23' });
    expect(res.headers.get('Cache-Control')).toContain('immutable');
  });

  it('?preview trunca em fim de versículo e omite verses[]', async () => {
    // 2 versos de 39 chars + separador = 79 chars; o 3º passaria de 100.
    const body = await json(await callChapter('?preview=100'));
    expect(body.data.verses).toBeUndefined();
    expect(body.data).toMatchObject({ verse: 1, verseEnd: 2, text: `${PSALM23[0]} ${PSALM23[1]}` });
    expect(body.meta).toMatchObject({ total: 6, truncated: true });
  });

  it('?preview maior que o capítulo → texto completo, truncated: false', async () => {
    const body = await json(await callChapter('?preview=2000'));
    expect(body.data.text).toBe(PSALM23.join(' '));
    expect(body.data.verseEnd).toBe(6);
    expect(body.meta.truncated).toBe(false);
  });

  it('?preview inválido é ignorado (capítulo completo)', async () => {
    const body = await json(await callChapter('?preview=abc'));
    expect(body.data.verses).toEqual(PSALM23);
    expect(body.meta.truncated).toBeUndefined();
  });

  it('preview e capítulo completo têm ETags distintos', async () => {
    const full = await callChapter();
    const preview = await callChapter('?preview=100');
    expect(full.headers.get('ETag')).not.toBe(preview.headers.get('ETag'));
  });
});

describe('parsePreviewParam', () => {
  it('clampa em [40, 2000] e canoniza', () => {
    expect(parsePreviewParam('300')).toBe(300);
    expect(parsePreviewParam('5')).toBe(40);
    expect(parsePreviewParam('999999')).toBe(2000);
  });

  it('inválido → null', () => {
    expect(parsePreviewParam(null)).toBeNull();
    expect(parsePreviewParam('')).toBeNull();
    expect(parsePreviewParam('abc')).toBeNull();
    expect(parsePreviewParam('0')).toBeNull();
    expect(parsePreviewParam('-5')).toBeNull();
    expect(parsePreviewParam('1.5')).toBeNull();
  });
});

describe('previewOfChapter', () => {
  it('sempre inclui o primeiro verso, mesmo acima do limite', () => {
    const p = previewOfChapter(['a'.repeat(500), 'b'], 40);
    expect(p.verseEnd).toBe(1);
    expect(p.truncated).toBe(true);
    expect(p.text).toBe('a'.repeat(500));
  });
});

describe('cache key do capítulo — o handler canoniza o preview', () => {
  async function keyFor(url: string, verseParam?: string) {
    const [, , , , version, book, chapter] = new URL(url).pathname.split('/');
    await handleV1Chapter(new Request(url), env, ctx, version, book, chapter, verseParam);
    return [...store.keys()];
  }

  it('preserva preview canônico (clampado) e descarta outros params', async () => {
    expect(await keyFor('https://api.midvash.com/v1/KJV/Psalms/23?preview=5&utm=x')).toEqual([
      'https://api.midvash.com/v1/kjv/psalms/23?preview=40&names=bn',
    ]);
  });

  it('sem preview válido, chave fica sem query', async () => {
    expect(await keyFor('https://api.midvash.com/v1/kjv/psalms/23?preview=abc')).toEqual([
      'https://api.midvash.com/v1/kjv/psalms/23?names=bn',
    ]);
  });

  it('rota de versículo não ganha preview (segue sem query)', async () => {
    expect(await keyFor('https://api.midvash.com/v1/kjv/psalms/23/1?preview=100', '1')).toEqual([
      'https://api.midvash.com/v1/kjv/psalms/23/1?names=bn',
    ]);
  });

  it('?locale entra na chave', async () => {
    expect(await keyFor('https://api.midvash.com/v1/kjv/psalms/23?locale=PT-BR')).toEqual([
      'https://api.midvash.com/v1/kjv/psalms/23?locale=pt-br&names=bn',
    ]);
  });
});

describe('nome do livro no idioma da versão', () => {
  function call(version: string, query = '', verses?: string) {
    const path = `/v1/${version}/psalms/23${verses ? `/${verses}` : ''}${query}`;
    return handleV1Chapter(new Request(`https://api.midvash.com${path}`), env, ctx, version, 'psalms', '23', verses);
  }

  it('versão em português responde com o nome em português', async () => {
    const chapter = await json(await call('nva'));
    expect(chapter.data.bookName).toBe('Salmos');
    expect(chapter.meta.reference).toBe('Salmos 23');
    expect(chapter.data.book).toBe('psalms');

    const range = await json(await call('nva', '', '1-2'));
    expect(range.meta.reference).toBe('Salmos 23:1-2');
  });

  it('versão em inglês segue em inglês', async () => {
    const body = await json(await call('kjv'));
    expect(body.data.bookName).toBe('Psalms');
    expect(body.meta.reference).toBe('Psalms 23');
  });

  it('?locale=en devolve o nome em inglês numa versão em português', async () => {
    const body = await json(await call('nva', '?locale=en', '1'));
    expect(body.data.bookName).toBe('Psalms');
    expect(body.meta.reference).toBe('Psalms 23:1');
  });
});

describe('atribuição da versão junto do texto', () => {
  it('capítulo inteiro, trecho e prévia levam meta.copyright do catálogo', async () => {
    const whole = await json(await callChapter());
    const preview = await json(await callChapter('?preview=50'));
    const range = await json(
      await handleV1Chapter(
        new Request('https://api.midvash.com/v1/kjv/psalms/23/1-2'),
        env,
        ctx,
        'kjv',
        'psalms',
        '23',
        '1-2',
      ),
    );
    for (const body of [whole, preview, range]) {
      expect(body.meta.copyright).toBe('King James Version (KJV)\nPublic Domain.');
    }
  });
});

describe('versão que saiu da API', () => {
  it('serve a versão livre no lugar e diz qual veio', async () => {
    const res = await handleV1Chapter(
      new Request('https://api.midvash.com/v1/nvt/psalms/23'),
      env,
      ctx,
      'nvt',
      'psalms',
      '23',
      undefined,
    );
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.version).toBe('kjv');
    expect(body.data.verses).toEqual(PSALM23);
  });

  it('alias pra slug inexistente vira 404', async () => {
    const res = await handleV1Chapter(
      new Request('https://api.midvash.com/v1/fora/psalms/23'),
      env,
      ctx,
      'fora',
      'psalms',
      '23',
      undefined,
    );
    expect(res.status).toBe(404);
  });

  it('/v1/versions/{alias} responde com a versão livre que a substitui', async () => {
    const res = await handleV1VersionDetail(
      new Request('https://api.midvash.com/v1/versions/nvt'),
      env,
      ctx,
      'nvt',
    );
    expect(res.status).toBe(200);
    expect((await json(res)).data.slug).toBe('kjv');
  });

  it('/v1/parse?version={alias} devolve o slug efetivo', async () => {
    const res = await handleV1Parse(
      new Request('https://api.midvash.com/v1/parse?q=psalms%2023&version=nvt'),
      env,
      ctx,
    );
    expect(res.status).toBe(200);
    expect((await json(res)).data.version).toBe('kjv');
  });
});

describe('/v1/parse devolve a referência inteira', () => {
  async function parse(query: string) {
    return json(await handleV1Parse(new Request(`https://api.midvash.com/v1/parse?${query}`), env, ctx));
  }

  it('no idioma da versão, com capítulo e versículos', async () => {
    const pt = await parse('q=Salmo%2023:1-2&version=nva');
    expect(pt.data.book_slug).toBe('psalms');
    expect(pt.meta.reference).toBe('Salmos 23:1-2');
  });

  it('sem versão, em inglês ou no ?locale', async () => {
    expect((await parse('q=salmos%2023')).meta.reference).toBe('Psalms 23');
    expect((await parse('q=salmos%2023:4&locale=pt-br')).meta.reference).toBe('Salmos 23:4');
  });
});

describe('nome do livro no /v1/passages', () => {
  function passages(query: string) {
    return handleV1Passages(new Request(`https://api.midvash.com/v1/passages?${query}`), env, ctx);
  }

  it('segue o idioma da versão e aceita ?locale', async () => {
    const pt = await json(await passages('refs=salmos 23:1,psalms 23&version=nva'));
    expect(pt.data[0].bookName).toBe('Salmos');
    expect(pt.data[0].reference).toBe('Salmos 23:1');
    expect(pt.data[1].reference).toBe('Salmos 23');

    const en = await json(await passages('refs=salmos 23:1&version=nva&locale=en'));
    expect(en.data[0].reference).toBe('Psalms 23:1');
  });
});
