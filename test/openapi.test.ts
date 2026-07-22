import { beforeEach, describe, expect, it } from 'vitest';
import { handleOpenApiJson, handleDocs } from '../src/handlers/openapi';
import type { Env } from '../src/env';

const env = {} as Env;
const ctx = { waitUntil: () => {} } as unknown as ExecutionContext;

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

beforeEach(() => stubCaches());

describe('GET /openapi.json', () => {
  it('retorna spec OpenAPI 3.x válido cobrindo todos os endpoints v1', async () => {
    const res = await handleOpenApiJson(new Request('https://api.midvash.com/openapi.json'), env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    const spec = JSON.parse(await res.text());
    expect(spec.openapi).toMatch(/^3\./);
    expect(Object.keys(spec.paths)).toEqual(
      expect.arrayContaining([
        '/v1',
        '/v1/versions',
        '/v1/versions/{slug}',
        '/v1/books',
        '/v1/books/{slug}',
        '/v1/{version}/{book}/{chapter}',
        '/v1/{version}/{book}/{chapter}/{verse}',
        '/v1/passages',
        '/v1/parse',
        '/v1/votd',
      ]),
    );
    expect(spec.components.schemas.Error.properties.error.properties.code.enum).toContain(
      'VERSE_NOT_FOUND',
    );
  });

  it('não é immutable (spec evolui com deploys) e tem ETag', async () => {
    const res = await handleOpenApiJson(new Request('https://api.midvash.com/openapi.json'), env, ctx);
    expect(res.headers.get('Cache-Control')).not.toContain('immutable');
    expect(res.headers.get('ETag')).toBeTruthy();
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('If-None-Match com ETag corrente → 304', async () => {
    const first = await handleOpenApiJson(new Request('https://api.midvash.com/openapi.json'), env, ctx);
    const etag = first.headers.get('ETag')!;
    const res = await handleOpenApiJson(
      new Request('https://api.midvash.com/openapi.json', { headers: { 'If-None-Match': etag } }),
      env,
      ctx,
    );
    expect(res.status).toBe(304);
  });
});

describe('GET /docs', () => {
  it('serve HTML apontando pro /openapi.json', async () => {
    const res = await handleDocs(new Request('https://api.midvash.com/docs'), env, ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('/openapi.json');
  });
});
