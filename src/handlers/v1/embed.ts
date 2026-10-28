/**
 * /v1/embed — rotas dos plugins (WordPress, EmDash, extensão do Chrome).
 *
 * Diferença pra API aberta: o catálogo é o do midvash.com inteiro, inclusive
 * as versões com direitos reservados que `/v1` troca pela livre. Citar um
 * versículo ou um capítulo num blog é uso normal; baixar a Bíblia inteira não.
 * Por isso as travas:
 *
 *   - Cada referência cabe num capítulo (o parser não aceita intervalo entre
 *     capítulos) e o batch leva no máximo EMBED_MAX_REFS referências.
 *   - Rate-limit por IP em toda rota de texto (binding RATE_LIMIT_EMBED). O
 *     429 nunca entra no cache.
 *   - Sucesso fica 1 dia no cache, não 1 ano: versão com direitos pode sair
 *     do ar e a resposta tem que sumir junto.
 *
 * Rotas:
 *   GET /v1/embed/versions                              → catálogo completo
 *   GET /v1/embed/passages?refs=&version=               → batch (≤ EMBED_MAX_REFS)
 *   GET /v1/embed/{version}/{book}/{chapter}[/{verses}] → mesmo shape de /v1
 */

import { METADATA_HEADERS, type Env } from '../../env';
import { contentHash, etagFor, normalizeCacheKey, serveWithCache } from '../../lib/cache';
import { errorResponse } from '../../lib/response';
import { getEmbedCatalog, type VersionDefinition } from '../../versions';
import { handleV1Chapter } from './chapters';
import { handleV1Passages, type PassagesVariant } from './passages';

export const EMBED_MAX_REFS = 10;

/** Requisições de texto por IP a cada 60 s (wrangler.toml, RATE_LIMIT_EMBED). */
export const EMBED_RATE_LIMIT = 30;

const EMBED_PASSAGES: PassagesVariant = {
  endpoint: 'v1-embed-passages',
  maxRefs: EMBED_MAX_REFS,
  catalog: getEmbedCatalog,
  immutable: false,
};

export async function handleV1Embed(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  path: string,
): Promise<Response> {
  if (path === '/versions') {
    return handleEmbedVersions(request, env, ctx);
  }

  const limited = await rateLimited(request, env);
  if (limited) return limited;

  if (path === '/passages') {
    return handleV1Passages(request, env, ctx, EMBED_PASSAGES);
  }

  const chapterMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/(\d+)(?:\/(.+))?$/);
  if (chapterMatch) {
    const [, version, book, chapter, verseParam] = chapterMatch;
    return handleV1Chapter(request, env, ctx, version, book, chapter, verseParam, {
      catalog: () => getEmbedCatalog(env),
    });
  }

  return errorResponse('NOT_FOUND', `Endpoint not found: /v1/embed${path}`);
}

/**
 * Sem o binding (dev local, teste) passa direto: a trava é de produção, e o
 * cache na frente do worker já segura repetição. Com o binding, estourou →
 * 429 `no-store` com `Retry-After`.
 */
async function rateLimited(request: Request, env: Env): Promise<Response | null> {
  if (!env.RATE_LIMIT_EMBED) return null;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.RATE_LIMIT_EMBED.limit({ key: ip });
  if (success) return null;
  const res = errorResponse(
    'RATE_LIMITED',
    `Too many requests. Limit is ${EMBED_RATE_LIMIT} per minute; batch references with /v1/embed/passages.`,
    { limit: EMBED_RATE_LIMIT, periodSeconds: 60 },
  );
  res.headers.set('Retry-After', '60');
  return res;
}

function serializeEmbedVersion(v: VersionDefinition) {
  return {
    slug: v.slug,
    name: v.name,
    shortName: v.shortName,
    language: v.language,
    hasOldTestament: v.hasOldTestament,
    hasNewTestament: v.hasNewTestament,
    totalBooks: v.totalBooks,
    totalChapters: v.totalChapters,
    restricted: v.restricted === true,
    ...(v.localizedNames ? { localizedNames: v.localizedNames } : {}),
    ...(v.copyright ? { copyright: v.copyright } : {}),
  };
}

function handleEmbedVersions(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const lang = url.searchParams.get('language')?.toLowerCase().trim() || undefined;
  return serveWithCache(request, ctx, normalizeCacheKey(request, { language: lang }), 'v1-embed-versions', async () => {
    const catalog = await getEmbedCatalog(env);
    const data = catalog.versions
      .filter((v) => !lang || v.language === lang)
      .map(serializeEmbedVersion);
    const body = JSON.stringify({
      data,
      meta: { total: data.length, ...(lang ? { language: lang } : {}) },
    });
    return {
      response: new Response(body, { headers: METADATA_HEADERS }),
      etag: etagFor(['v1', 'embed', 'versions', contentHash(body)]),
    };
  });
}
