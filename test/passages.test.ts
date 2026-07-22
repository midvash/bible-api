import { beforeEach, describe, expect, it } from 'vitest';
import { handleV1Passages } from '../src/handlers/v1/passages';
import { handleV1Parse } from '../src/handlers/v1/parse';
import { lookupBook } from '../src/lib/book-lookup';
import type { Env } from '../src/env';

const GEN = lookupBook('genesis').book!.id;
const JOHN = lookupBook('john').book!.id;
const PS = lookupBook('psalms').book!.id;

const GENESIS1 = ['In the beginning…', 'And the earth was…', 'And God said…'];
const JOHN3 = Array.from({ length: 16 }, (_, i) => (i === 15 ? 'For God so loved the world…' : `v${i + 1}`));
const PSALM23 = ['The LORD is my shepherd…'];

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
      if (key === `kjv/${GEN}/1.json`) return { text: async () => JSON.stringify(GENESIS1) };
      if (key === `kjv/${JOHN}/3.json`) return { text: async () => JSON.stringify(JOHN3) };
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

describe('GET /v1/passages', () => {
  it('resolve múltiplas refs na ordem do input', async () => {
    const req = new Request(
      'https://api.midvash.com/v1/passages?version=kjv&refs=' +
        encodeURIComponent('john 3:16,genesis 1:1-3,psalms 23'),
    );
    const body = await json(await handleV1Passages(req, env, ctx));
    expect(body.meta).toMatchObject({ total: 3, version: 'kjv', resolved: 3, failed: 0 });
    expect(body.data[0]).toMatchObject({ ref: 'john 3:16', chapter: 3, verse: 16, text: 'For God so loved the world…' });
    expect(body.data[1]).toMatchObject({ chapter: 1, verse: 1, verseEnd: 3 });
    expect(body.data[1].verses).toHaveLength(3);
    expect(body.data[2]).toMatchObject({ chapter: 23, reference: 'Psalms 23' });
    expect(body.data[2].verse).toBeUndefined(); // capítulo inteiro
  });

  it('uma ref ruim não derruba o batch', async () => {
    const req = new Request(
      'https://api.midvash.com/v1/passages?version=kjv&refs=' +
        encodeURIComponent('john 3:16,notabook 1:1,psalms 23'),
    );
    const res = await handleV1Passages(req, env, ctx);
    const body = await json(res);
    expect(body.meta).toMatchObject({ resolved: 2, failed: 1 });
    expect(body.data[1].error).toContain('not found');
    expect(res.headers.get('Cache-Control')).toContain('max-age=300'); // batch parcial
  });

  it('versão inválida derruba o batch (404)', async () => {
    const req = new Request('https://api.midvash.com/v1/passages?version=nope&refs=john 3:16');
    const res = await handleV1Passages(req, env, ctx);
    expect(res.status).toBe(404);
  });

  it('mais de 20 refs → 400', async () => {
    const refs = Array.from({ length: 21 }, () => 'john 3:16').join(',');
    const res = await handleV1Passages(
      new Request('https://api.midvash.com/v1/passages?version=kjv&refs=' + encodeURIComponent(refs)),
      env,
      ctx,
    );
    expect(res.status).toBe(400);
  });

  it('refs faltando → 400', async () => {
    const res = await handleV1Passages(
      new Request('https://api.midvash.com/v1/passages?version=kjv'),
      env,
      ctx,
    );
    expect(res.status).toBe(400);
  });
});

describe('GET /v1/parse', () => {
  it('resolve referência com intervalo', async () => {
    const res = await handleV1Parse(
      new Request('https://api.midvash.com/v1/parse?q=' + encodeURIComponent('João 3:16-18')),
      env,
      ctx,
    );
    const body = await json(res);
    expect(body.data).toMatchObject({
      bookId: JOHN,
      book_slug: 'john',
      chapter: 3,
      verse_start: 16,
      verse_end: 18,
    });
  });

  it('capítulo inteiro → versos nulos', async () => {
    const body = await json(
      await handleV1Parse(new Request('https://api.midvash.com/v1/parse?q=psalms 23'), env, ctx),
    );
    expect(body.data).toMatchObject({ book_slug: 'psalms', chapter: 23, verse_start: null, verse_end: null });
  });

  it('livro inexistente → 404 com didYouMean', async () => {
    const res = await handleV1Parse(
      new Request('https://api.midvash.com/v1/parse?q=' + encodeURIComponent('gensis 1:1')),
      env,
      ctx,
    );
    expect(res.status).toBe(404);
    const body = await json(res);
    expect(body.error.details.didYouMean).toBe('genesis');
  });

  it('version válida é ecoada', async () => {
    const body = await json(
      await handleV1Parse(new Request('https://api.midvash.com/v1/parse?q=john 3:16&version=kjv'), env, ctx),
    );
    expect(body.data.version).toBe('kjv');
  });

  it('q faltando → 400', async () => {
    const res = await handleV1Parse(new Request('https://api.midvash.com/v1/parse'), env, ctx);
    expect(res.status).toBe(400);
  });
});
