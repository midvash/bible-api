import {
  getVersionCatalog,
  type VersionCatalog,
  type VersionDefinition,
} from '../../versions';
import { CACHE_HEADERS, type Env } from '../../env';
import { etagFor, normalizeCacheKey, serveWithCache } from '../../lib/cache';
import { errorResponse, okResponse } from '../../lib/response';

function serializeVersion(v: VersionDefinition) {
  return {
    slug: v.slug,
    name: v.name,
    shortName: v.shortName,
    language: v.language,
    hasOldTestament: v.hasOldTestament,
    hasNewTestament: v.hasNewTestament,
    totalBooks: v.totalBooks,
    totalChapters: v.totalChapters,
  };
}

/**
 * Bodies pré-serializados por isolate. Antes eram constantes de module scope
 * (o catálogo vinha de um import build-time); agora o catálogo vem do R2, então
 * derivamos lazy a partir dele e memoizamos — input estável, stringify uma vez.
 * Só memoiza quando há dados (catálogo vazio = degradação transitória do R2).
 */
interface PrebakedVersions {
  allBody: string;
  byLanguage: Record<string, string>;
  listEtag: string;
}
let prebaked: PrebakedVersions | null = null;

function getPrebaked(catalog: VersionCatalog): PrebakedVersions {
  if (prebaked) return prebaked;

  const allData = catalog.versions.map(serializeVersion);
  const allBody = JSON.stringify({ data: allData, meta: { total: allData.length } });

  const byLanguage: Record<string, string> = {};
  const langs = new Set(catalog.versions.map((v) => v.language));
  for (const lang of langs) {
    const filtered = catalog.versions.filter((v) => v.language === lang).map(serializeVersion);
    byLanguage[lang] = JSON.stringify({
      data: filtered,
      meta: { total: filtered.length, language: lang },
    });
  }

  const result: PrebakedVersions = {
    allBody,
    byLanguage,
    listEtag: etagFor(['v1', 'versions', 'list', catalog.versions.length]),
  };
  if (catalog.versions.length > 0) prebaked = result;
  return result;
}

/**
 * GET /v1/versions[?language=pt-br|en|es|...]
 */
export function handleV1VersionsList(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'v1-versions-list', async () => {
    const { allBody, byLanguage, listEtag } = getPrebaked(await getVersionCatalog(env));

    const languageParam = new URL(request.url).searchParams.get('language');
    if (!languageParam) {
      return { response: new Response(allBody, { headers: CACHE_HEADERS }), etag: listEtag };
    }

    const lang = languageParam.toLowerCase().trim();
    const body = byLanguage[lang] ?? JSON.stringify({ data: [], meta: { total: 0, language: lang } });
    return {
      response: new Response(body, { headers: CACHE_HEADERS }),
      etag: etagFor(['v1', 'versions', 'list', lang]),
    };
  });
}

/**
 * GET /v1/versions/{slug}
 */
export function handleV1VersionDetail(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  slug: string,
): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'v1-version-detail', async () => {
    const catalog = await getVersionCatalog(env);
    const versionSlug = slug.toLowerCase().trim();
    const version = catalog.bySlug.get(versionSlug);
    if (!version) {
      return errorResponse('VERSION_NOT_FOUND', `Version "${slug}" not found.`, {
        availableVersions: catalog.versions.length,
      });
    }

    return {
      response: okResponse(serializeVersion(version)),
      etag: etagFor(['v1', 'version', versionSlug]),
    };
  });
}
