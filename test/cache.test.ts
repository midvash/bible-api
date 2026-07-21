import { beforeEach, describe, expect, it } from 'vitest';
import { buildCacheKey, normalizeCacheKey, serveWithCache } from '../src/lib/cache';

/** Stub do Cache API global (caches.default) para os testes. */
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
  return store;
}

function fakeCtx() {
  const pending: Promise<unknown>[] = [];
  return {
    ctx: { waitUntil: (p: Promise<unknown>) => pending.push(p) } as unknown as ExecutionContext,
    flush: () => Promise.all(pending),
  };
}

describe('normalizeCacheKey', () => {
  it('normaliza o locale legado com a regra canônica (pt-pt → pt-br)', () => {
    const key = normalizeCacheKey(new Request('https://api.midvash.com/versions?locale=pt-pt'));
    expect(new URL(key.url).search).toBe('?locale=pt-br');
  });

  it('preserva locales além de pt/es (fr não colapsa mais em en)', () => {
    const key = normalizeCacheKey(new Request('https://api.midvash.com/versions?locale=fr'));
    expect(new URL(key.url).search).toBe('?locale=fr');
  });

  it('descarta query irrelevante e lowercase o path', () => {
    const key = normalizeCacheKey(new Request('https://api.midvash.com/NVI/John/3?utm=x'));
    expect(new URL(key.url).pathname).toBe('/nvi/john/3');
    expect(new URL(key.url).search).toBe('');
  });
});

describe('serveWithCache', () => {
  beforeEach(() => {
    stubCaches();
  });

  const key = () => buildCacheKey({ endpoint: 'test' });

  it('miss produz, cacheia e serve com ETag', async () => {
    const { ctx, flush } = fakeCtx();
    let calls = 0;
    const produce = () => {
      calls++;
      return new Response('{"ok":true}', {
        headers: { 'Cache-Control': 'public, max-age=60', 'Content-Type': 'application/json' },
      });
    };

    const req = new Request('https://api.midvash.com/x');
    const first = await serveWithCache(req, ctx, key(), 'test', produce);
    expect(first.status).toBe(200);
    expect(first.headers.get('ETag')).toBeTruthy();
    await flush();

    const second = await serveWithCache(req, ctx, key(), 'test', produce);
    expect(await second.text()).toBe('{"ok":true}');
    expect(calls).toBe(1); // hit não re-produz
  });

  it('revalidação com If-None-Match devolve 304 sem corpo', async () => {
    const { ctx, flush } = fakeCtx();
    const produce = () => ({
      response: new Response('body', { headers: { 'Cache-Control': 'public, max-age=60' } }),
      etag: '"stable-etag"',
    });

    const first = await serveWithCache(new Request('https://api.midvash.com/x'), ctx, key(), 't', produce);
    expect(first.headers.get('ETag')).toBe('"stable-etag"');
    await flush();

    const revalidate = new Request('https://api.midvash.com/x', {
      headers: { 'If-None-Match': '"stable-etag"' },
    });
    const second = await serveWithCache(revalidate, ctx, key(), 't', produce);
    expect(second.status).toBe(304);
    expect(await second.text()).toBe('');
  });

  it('5xx e no-store passam direto, sem entrar no cache', async () => {
    const { ctx, flush } = fakeCtx();
    let calls = 0;
    const produce = () => {
      calls++;
      return new Response('erro', { status: 500, headers: { 'Cache-Control': 'no-store' } });
    };

    const req = new Request('https://api.midvash.com/x');
    await serveWithCache(req, ctx, key(), 't', produce);
    await flush();
    await serveWithCache(req, ctx, key(), 't', produce);
    expect(calls).toBe(2); // nada foi cacheado
  });

  it('HEAD serve headers sem corpo', async () => {
    const { ctx } = fakeCtx();
    const head = new Request('https://api.midvash.com/x', { method: 'HEAD' });
    const res = await serveWithCache(head, ctx, key(), 't', () =>
      new Response('body', { headers: { 'Cache-Control': 'public, max-age=60' } }),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
  });
});
