import { beforeEach, describe, expect, it } from 'vitest';
import { handleV1Chapter } from '../src/handlers/v1/chapters';
import { parsePreviewParam, previewOfChapter } from '../src/lib/chapter';
import { normalizeCacheKey } from '../src/lib/cache';
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
  },
];

const env = {
  R2_BUCKET: {
    async get(key: string) {
      if (key === 'catalog/versions.json') return { json: async () => CATALOG };
      if (key === `kjv/${PS}/23.json`) return { text: async () => JSON.stringify(PSALM23) };
      return null;
    },
  },
} as unknown as Env;

function stubCaches() {
  const store = new Map<string, Response>();
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

describe('normalizeCacheKey — preview de capítulo', () => {
  it('preserva preview canônico e descarta outros params', () => {
    const key = normalizeCacheKey(
      new Request('https://api.midvash.com/v1/KJV/Psalms/23?preview=5&utm=x'),
    );
    expect(key.url).toBe('https://api.midvash.com/v1/kjv/psalms/23?preview=40');
  });

  it('sem preview válido, chave fica sem query', () => {
    const key = normalizeCacheKey(new Request('https://api.midvash.com/v1/kjv/psalms/23?preview=abc'));
    expect(key.url).toBe('https://api.midvash.com/v1/kjv/psalms/23');
  });

  it('rota de versículo não ganha preview (segue sem query)', () => {
    const key = normalizeCacheKey(new Request('https://api.midvash.com/v1/kjv/john/3/16?preview=100'));
    expect(key.url).toBe('https://api.midvash.com/v1/kjv/john/3/16');
  });
});
