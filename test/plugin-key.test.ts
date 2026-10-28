import { beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';
import { lookupBook } from '../src/lib/book-lookup';
import type { Env } from '../src/env';

const JOHN = lookupBook('john').book!.id;
const JOHN3 = (tag: string) => Array.from({ length: 16 }, (_, i) => `${tag} v${i + 1}`);
const KEY = 'chave-de-teste-0123456789';

const base = { hasOldTestament: true, hasNewTestament: true, totalBooks: 66, totalChapters: 1189 };
const KJV = { slug: 'kjv', name: 'King James Version', shortName: 'KJV', language: 'en', ...base };
const NIV = { slug: 'niv', name: 'New International Version', shortName: 'NIV', language: 'en', ...base, restricted: true };

const env = {
  PLUGIN_KEY: KEY,
  R2_BUCKET: {
    async get(key: string) {
      if (key === 'catalog/versions.json') return { json: async () => [KJV] };
      if (key === 'catalog/version-aliases.json') return { json: async () => ({ niv: 'kjv' }) };
      if (key === 'catalog/plugin-versions.json') return { json: async () => [KJV, NIV] };
      if (key === `kjv/${JOHN}/3.json`) return { text: async () => JSON.stringify(JOHN3('kjv')) };
      if (key === `niv/${JOHN}/3.json`) return { text: async () => JSON.stringify(JOHN3('niv')) };
      return null;
    },
  },
} as unknown as Env;

// Cache API em memória, compartilhado entre os pedidos de cada teste: é ele
// que provaria um vazamento entre público e plugin.
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

const ctx = { waitUntil: (p: Promise<unknown>) => p } as unknown as ExecutionContext;
function get(path: string, headers: Record<string, string> = {}) {
  return worker.fetch(new Request(`https://api.midvash.com${path}`, { headers }), env, ctx);
}
const plugin = { 'X-Midvash-Plugin-Key': KEY };

describe('X-Midvash-Plugin-Key', () => {
  it('sem chave: versão com direitos troca pela livre, como hoje', async () => {
    const res = await get('/v1/niv/john/3/16');
    const body = await res.json<{ data: { version: string } }>();
    expect(body.data.version).toBe('kjv');
    expect(res.headers.get('Vary')).toContain('X-Midvash-Plugin-Key');
  });

  it('com chave: devolve o texto da própria versão, com cache de 1 dia', async () => {
    const res = await get('/v1/niv/john/3/16', plugin);
    const body = await res.json<{ data: { version: string; text: string } }>();
    expect(body.data).toMatchObject({ version: 'niv', text: 'niv v16' });
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400, s-maxage=86400');
    expect(res.headers.get('Vary')).toContain('X-Midvash-Plugin-Key');
  });

  it('cache não vaza do público pro plugin nem do plugin pro público', async () => {
    const a = await (await get('/v1/niv/john/3/16')).json<{ data: { version: string } }>();
    const b = await (await get('/v1/niv/john/3/16', plugin)).json<{ data: { version: string } }>();
    const c = await (await get('/v1/niv/john/3/16')).json<{ data: { version: string } }>();
    expect([a.data.version, b.data.version, c.data.version]).toEqual(['kjv', 'niv', 'kjv']);

    const p1 = await (await get('/v1/passages?version=niv&refs=john%203:16', plugin)).json<{ meta: { version: string } }>();
    const p2 = await (await get('/v1/passages?version=niv&refs=john%203:16')).json<{ meta: { version: string } }>();
    expect([p1.meta.version, p2.meta.version]).toEqual(['niv', 'kjv']);
  });

  it('chave errada ou marcador interno forjado não liberam nada', async () => {
    const wrong = await (await get('/v1/niv/john/3/16', { 'X-Midvash-Plugin-Key': 'x'.repeat(KEY.length) })).json<{ data: { version: string } }>();
    const spoof = await (await get('/v1/niv/john/3/16', { 'X-Midvash-Plugin-Variant': '1' })).json<{ data: { version: string } }>();
    expect([wrong.data.version, spoof.data.version]).toEqual(['kjv', 'kjv']);
  });

  it('/v1/versions com chave lista o catálogo completo; sem chave, só as livres', async () => {
    const open = await (await get('/v1/versions')).json<{ data: { slug: string }[] }>();
    const full = await (await get('/v1/versions', plugin)).json<{ data: { slug: string; restricted?: boolean }[] }>();
    const again = await (await get('/v1/versions')).json<{ data: { slug: string }[] }>();
    expect(open.data.map((v) => v.slug)).toEqual(['kjv']);
    expect(full.data.map((v) => [v.slug, v.restricted ?? false])).toEqual([['kjv', false], ['niv', true]]);
    expect(again.data.map((v) => v.slug)).toEqual(['kjv']);
  });

  it('rota legada também respeita a chave', async () => {
    const body = await (await get('/niv/john/3/16', plugin)).json<{ version: string }>();
    expect(body.version).toBe('niv');
  });
});
