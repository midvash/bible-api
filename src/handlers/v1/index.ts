import type { Env } from '../../env';
import { errorResponse } from '../../lib/response';
import { handleV1Root } from './root';
import { handleV1VersionsList, handleV1VersionDetail } from './versions';
import { handleV1BooksList, handleV1BookDetail } from './books';
import { handleV1Chapter } from './chapters';
import { handleVotd } from '../votd';

/**
 * Despacha qualquer request começando com /v1.
 *
 * Os matches são feitos em ordem do mais específico para o mais genérico.
 * O último match (chapter) é o catch-all que usa /v1/{version}/{book}/{chapter}.
 */
export async function handleV1(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  pathAfterV1: string,
): Promise<Response> {
  const path = pathAfterV1.replace(/\/+$/, ''); // sem trailing slash

  // /v1
  if (path === '' || path === '/') {
    return handleV1Root(request, env, ctx);
  }

  // /v1/versions, /v1/versions/{slug}
  if (path === '/versions') {
    return handleV1VersionsList(request, env, ctx);
  }
  const versionMatch = path.match(/^\/versions\/([^\/]+)$/);
  if (versionMatch) {
    return handleV1VersionDetail(request, env, ctx, versionMatch[1]);
  }

  // /v1/votd — alias do /votd raiz pra catálogo v1 e LP
  if (path === '/votd') {
    return handleVotd(request, env, ctx);
  }

  // /v1/books, /v1/books/{slug}
  if (path === '/books') {
    return handleV1BooksList(request, env, ctx);
  }
  const bookMatch = path.match(/^\/books\/([^\/]+)$/);
  if (bookMatch) {
    return handleV1BookDetail(request, env, ctx, bookMatch[1]);
  }

  // /v1/{version}/{book}/{chapter}[/{verses}]  — catch-all do conteúdo bíblico
  const chapterMatch = path.match(/^\/([^\/]+)\/([^\/]+)\/(\d+)(?:\/(.+))?$/);
  if (chapterMatch) {
    const [, version, book, chapter, verseParam] = chapterMatch;
    return handleV1Chapter(request, env, ctx, version, book, chapter, verseParam);
  }

  return errorResponse('NOT_FOUND', `Endpoint not found: /v1${pathAfterV1}`);
}
