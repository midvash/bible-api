import { beforeEach, describe, expect, it } from 'vitest';
import { handleVotd } from '../src/handlers/votd';
import type { Env } from '../src/env';

const CATALOG = [
  { slug: 'onbv', name: 'Open Nova Bíblia Viva', shortName: 'ONBV', language: 'pt-br', hasOldTestament: true, hasNewTestament: true, totalBooks: 66, totalChapters: 1189 },
  { slug: 'kjv', name: 'King James Version', shortName: 'KJV', language: 'en', hasOldTestament: true, hasNewTestament: true, totalBooks: 66, totalChapters: 1189 },
];

// Qualquer capítulo do pool: 200 versos, o suficiente pra qualquer referência.
const VERSES = Array.from({ length: 200 }, (_, i) => `v${i + 1}`);

const env = {
  R2_BUCKET: {
    async get(key: string) {
      if (key === 'catalog/versions.json') return { json: async () => CATALOG };
      if (key === 'catalog/version-aliases.json') return { json: async () => ({ nvi: 'onbv' }) };
      if (/^(onbv|kjv)\/\d+\/\d+\.json$/.test(key)) return { text: async () => JSON.stringify(VERSES) };
      return null;
    },
  },
} as unknown as Env;

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext;

beforeEach(() => {
  const store = new Map<string, Response>();
  (globalThis as Record<string, unknown>).caches = {
    default: {
      async match(key: Request) {
        return store.get(key.url)?.clone();
      },
      async put(key: Request, res: Response) {
        store.set(key.url, res);
      },
    },
  };
});

async function votd(query: string) {
  const res = await handleVotd(new Request(`https://api.midvash.com/votd?${query}`), env, ctx);
  return JSON.parse(await res.text());
}

describe('votd sem language', () => {
  it('sai no idioma da versão, com link válido', async () => {
    const body = await votd('version=nvi');
    expect(body.version).toBe('onbv');
    expect(body.url).toMatch(/^https:\/\/midvash\.com\/pt-br\/onbv\//);
  });

  it('inglês não leva prefixo /en no link', async () => {
    const body = await votd('version=kjv');
    expect(body.url).toMatch(/^https:\/\/midvash\.com\/kjv\//);
  });

  it('language explícito vence', async () => {
    const body = await votd('version=onbv&language=en');
    expect(body.url).toMatch(/^https:\/\/midvash\.com\/onbv\//);
  });
});
