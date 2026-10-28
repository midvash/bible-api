import { beforeEach, describe, expect, it } from 'vitest';
import { handleV1 } from '../src/handlers/v1';
import { lookupBook } from '../src/lib/book-lookup';
import type { Env } from '../src/env';

const JOHN = lookupBook('john').book!.id;
const JOHN3 = (tag: string) => Array.from({ length: 16 }, (_, i) => `${tag} v${i + 1}`);

const base = {
  hasOldTestament: true,
  hasNewTestament: true,
  totalBooks: 66,
  totalChapters: 1189,
};
const KJV = { slug: 'kjv', name: 'King James Version', shortName: 'KJV', language: 'en', ...base };
const NIV = { slug: 'niv', name: 'New International Version', shortName: 'NIV', language: 'en', ...base, restricted: true };

function makeEnv(extra: Partial<Env> = {}): Env {
  return {
    R2_BUCKET: {
      async get(key: string) {
        if (key === 'catalog/versions.json') return { json: async () => [KJV] };
        if (key === 'catalog/version-aliases.json') return { json: async () => ({ niv: 'kjv' }) };
        if (key === 'catalog/embed-versions.json') return { json: async () => [KJV, NIV] };
        if (key === `kjv/${JOHN}/3.json`) return { text: async () => JSON.stringify(JOHN3('kjv')) };
        if (key === `niv/${JOHN}/3.json`) return { text: async () => JSON.stringify(JOHN3('niv')) };
        return null;
      },
    },
    ...extra,
  } as unknown as Env;
}

beforeEach(() => {
  const store = new Map<string, Response>();
  (globalThis as Record<string, unknown>).caches = {
    default: {
      async match(key: Request) {
        return store.get(key.url)?.clone();
      },
      async put(key: Request, response: Response) {
        store.set(key.url, response);
      },
    },
  };
});

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext;
const get = (path: string, env = makeEnv()) =>
  handleV1(new Request(`https://api.midvash.com/v1${path}`), env, ctx, path.split('?')[0]);

describe('/v1/embed', () => {
  it('lista o catálogo completo, com a versão com direitos marcada', async () => {
    const body = await (await get('/embed/versions')).json<{ data: { slug: string; restricted: boolean }[] }>();
    expect(body.data.map((v) => [v.slug, v.restricted])).toEqual([
      ['kjv', false],
      ['niv', true],
    ]);
  });

  it('serve o texto da versão com direitos, com cache de 1 dia', async () => {
    const res = await get('/embed/niv/john/3/16');
    const body = await res.json<{ data: { version: string; text: string } }>();
    expect(body.data).toMatchObject({ version: 'niv', text: 'niv v16' });
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400, s-maxage=86400');
  });

  it('a API aberta continua trocando a versão com direitos pela livre', async () => {
    const body = await (await get('/niv/john/3/16')).json<{ data: { version: string } }>();
    expect(body.data.version).toBe('kjv');
  });

  it('passages do embed aceita até 10 referências', async () => {
    const refs = Array.from({ length: 11 }, () => 'john 3:16').join(',');
    const res = await get(`/embed/passages?version=niv&refs=${encodeURIComponent(refs)}`);
    expect(res.status).toBe(400);
    const ok = await get(`/embed/passages?version=niv&refs=${encodeURIComponent('john 3:16,john 3:1-2')}`);
    const body = await ok.json<{ meta: { version: string; resolved: number } }>();
    expect(body.meta).toMatchObject({ version: 'niv', resolved: 2 });
    expect(ok.headers.get('Cache-Control')).not.toContain('immutable');
  });

  it('estourou o limite por IP → 429 sem cache, com Retry-After', async () => {
    const env = makeEnv({ RATE_LIMIT_EMBED: { limit: async () => ({ success: false }) } as unknown as RateLimit });
    const res = await get('/embed/niv/john/3/16', env);
    expect(res.status).toBe(429);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('Retry-After')).toBe('60');
  });
});
