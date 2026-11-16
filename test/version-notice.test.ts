import { beforeEach, describe, expect, it } from 'vitest';
import { handleV1Chapter } from '../src/handlers/v1/chapters';
import { handleV1Passages } from '../src/handlers/v1/passages';
import { lookupBook } from '../src/lib/book-lookup';
import { versionNotice, versionNoticeHeaders } from '../src/lib/version-notice';
import type { Env } from '../src/env';

// `nvi` saiu da API (direitos reservados) e o alias manda pra `onbv`. Antes a
// troca era calada: a resposta dizia `version: "onbv"` e mais nada.
const ROM = lookupBook('romans').book!.id;
const ROMANS8 = Array.from({ length: 39 }, (_, i) => `v${i + 1}`);

const CATALOG = [
  {
    slug: 'onbv',
    name: 'Nova Bíblia Viva',
    shortName: 'ONBV',
    language: 'pt-br',
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
      if (key === 'catalog/version-aliases.json') return { json: async () => ({ nvi: 'onbv' }) };
      if (key === `onbv/${ROM}/8.json`) return { text: async () => JSON.stringify(ROMANS8) };
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

describe('versionNotice', () => {
  it('é null quando a versão pedida é a que respondeu', () => {
    expect(versionNotice('onbv', 'onbv')).toBeNull();
    expect(versionNoticeHeaders(null)).toEqual({});
  });

  it('diz a pedida e a servida quando houve troca', () => {
    expect(versionNotice('nvi', 'onbv')).toMatchObject({ requested: 'nvi', served: 'onbv' });
  });
});

describe('versão trocada por alias', () => {
  it('o versículo avisa no meta e nos headers', async () => {
    const res = await handleV1Chapter(
      new Request('https://api.midvash.com/v1/nvi/romans/8/28'),
      env,
      ctx,
      'nvi',
      'romans',
      '8',
      '28',
    );
    const body = JSON.parse(await res.text());
    expect(body.data.version).toBe('onbv');
    expect(body.meta.versionNotice).toMatchObject({ requested: 'nvi', served: 'onbv' });
    expect(res.headers.get('X-Midvash-Requested-Version')).toBe('nvi');
    expect(res.headers.get('X-Midvash-Served-Version')).toBe('onbv');
    expect(res.headers.get('Access-Control-Expose-Headers')).toContain('X-Midvash-Served-Version');
  });

  it('o batch de passagens avisa no meta e nos headers', async () => {
    const res = await handleV1Passages(
      new Request('https://api.midvash.com/v1/passages?version=NVI&refs=romans%208:28'),
      env,
      ctx,
    );
    const body = JSON.parse(await res.text());
    expect(body.meta.version).toBe('onbv');
    expect(body.meta.versionNotice).toMatchObject({ requested: 'nvi', served: 'onbv' });
    expect(res.headers.get('X-Midvash-Requested-Version')).toBe('nvi');
  });

  it('a versão pedida certa não leva aviso', async () => {
    const res = await handleV1Chapter(
      new Request('https://api.midvash.com/v1/onbv/romans/8/28'),
      env,
      ctx,
      'onbv',
      'romans',
      '8',
      '28',
    );
    const body = JSON.parse(await res.text());
    expect(body.meta).not.toHaveProperty('versionNotice');
    expect(res.headers.get('X-Midvash-Requested-Version')).toBeNull();
    expect(res.headers.get('Cache-Control')).toContain('immutable');
  });
});
