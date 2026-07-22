import { beforeEach, describe, expect, it } from 'vitest';
import { handleV1VersionsList, handleV1VersionDetail } from '../src/handlers/v1/versions';
import type { Env } from '../src/env';

// kjv enriquecida; nvt "pelada" — garante que os campos são aditivos e só saem
// quando o catálogo os traz.
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
    localizedNames: { 'pt-br': 'Versão Rei Jaime', es: 'Versión del Rey Jacobo' },
    copyright: 'Public domain.',
  },
  {
    slug: 'nvt',
    name: 'Nova Versão Transformadora',
    shortName: 'NVT',
    language: 'pt-br',
    hasOldTestament: true,
    hasNewTestament: true,
    totalBooks: 66,
    totalChapters: 1036,
  },
];

const env = {
  R2_BUCKET: {
    async get(key: string) {
      if (key === 'catalog/versions.json') return { json: async () => CATALOG };
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

describe('/v1/versions enriquecido', () => {
  it('inclui localizedNames + copyright quando presentes, omite quando ausentes', async () => {
    const body = await json(
      await handleV1VersionsList(new Request('https://api.midvash.com/v1/versions'), env, ctx),
    );
    const kjv = body.data.find((v: { slug: string }) => v.slug === 'kjv');
    const nvt = body.data.find((v: { slug: string }) => v.slug === 'nvt');

    expect(kjv.localizedNames).toEqual({ 'pt-br': 'Versão Rei Jaime', es: 'Versión del Rey Jacobo' });
    expect(kjv.copyright).toBe('Public domain.');
    expect(nvt).not.toHaveProperty('localizedNames');
    expect(nvt).not.toHaveProperty('copyright');
  });

  it('o detalhe também expõe os campos', async () => {
    const body = await json(
      await handleV1VersionDetail(new Request('https://api.midvash.com/v1/versions/kjv'), env, ctx, 'kjv'),
    );
    expect(body.data.localizedNames['pt-br']).toBe('Versão Rei Jaime');
    expect(body.data.copyright).toBe('Public domain.');
  });

  it('o ETag da lista mudou de shape (contém "enriched")', async () => {
    const res = await handleV1VersionsList(new Request('https://api.midvash.com/v1/versions'), env, ctx);
    expect(res.headers.get('ETag')).toContain('enriched');
  });
});
