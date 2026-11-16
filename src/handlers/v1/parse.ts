/**
 * GET /v1/parse?q=<referência>[&version=<slug>]
 *
 * Resolve uma referência em texto livre para as suas partes canônicas, SEM
 * tocar no conteúdo bíblico (não lê capítulo do R2). Puro léxico + dicionário
 * de livros.
 *
 *   /v1/parse?q=João 3:16-18
 *   → { bookId: 43, book_slug: "john", chapter: 3, verse_start: 16, verse_end: 18 }
 *
 * Uso: oráculo para testes de CI do plugin WordPress validarem o dicionário de
 * livros deles contra o da API (hoje duplicado e sujeito a drift). Não é hot path.
 *
 * `book_slug` é sempre o slug canônico em inglês (chave estável), independente
 * do idioma em que a referência foi escrita. `version` só aparece no retorno se
 * passada e válida.
 */

import type { Env } from '../../env';
import { buildCacheKey, etagFor, serveWithCache } from '../../lib/cache';
import { errorResponse, okResponse } from '../../lib/response';
import { getVersionCatalog } from '../../versions';
import { lookupBook } from '../../lib/book-lookup';
import { formatReference } from '../../lib/chapter';
import { displayLocale } from '../../lib/locale';
import { parseReference } from '../../lib/reference';

export function handleV1Parse(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const versionParam = (url.searchParams.get('version') ?? '').toLowerCase().trim();
  const localeParam = url.searchParams.get('locale')?.trim().toLowerCase() || null;

  if (!q) {
    return Promise.resolve(errorResponse('INVALID_PARAMS', 'Missing required query param: q.'));
  }

  const cacheKey = buildCacheKey({
    endpoint: 'v1-parse',
    q: q.toLowerCase().replace(/\s+/g, ' '),
    version: versionParam || undefined,
    locale: localeParam ?? undefined,
    // `ref`: meta.reference passou de "Salmos" a "Salmos 23:1-2".
    shape: 'ref',
  });

  return serveWithCache(request, ctx, cacheKey, 'v1-parse', async () => {
    const parsed = parseReference(q);
    if (!parsed) {
      return errorResponse('INVALID_PARAMS', `Could not parse reference: "${q}".`);
    }

    const { book, didYouMean } = lookupBook(parsed.bookQuery);
    if (!book) {
      return errorResponse(
        'BOOK_NOT_FOUND',
        didYouMean
          ? `Book "${parsed.bookRaw}" not found. Did you mean "${didYouMean}"?`
          : `Book "${parsed.bookRaw}" not found.`,
        didYouMean ? { didYouMean } : undefined,
      );
    }

    if (parsed.chapter > book.chapters) {
      return errorResponse(
        'INVALID_PARAMS',
        `Invalid chapter ${parsed.chapter}. ${book.names.en} has ${book.chapters} chapters.`,
        { maxChapters: book.chapters },
      );
    }

    // Versão é opcional; se passada, precisa existir (oráculo não deve validar
    // silenciosamente uma versão inexistente).
    // Alias de versão que saiu da API devolve o slug efetivo, como nas rotas
    // de conteúdo.
    let version: string | undefined;
    let versionLanguage = 'en';
    if (versionParam) {
      const found = (await getVersionCatalog(env)).lookup(versionParam);
      if (!found) {
        return errorResponse('VERSION_NOT_FOUND', `Version "${versionParam}" not found.`);
      }
      version = found.slug;
      versionLanguage = found.version.language;
    }

    // Referência inteira no idioma da versão (ou do ?locale; sem os dois, en).
    const locale = displayLocale(versionLanguage, localeParam);
    const reference =
      parsed.verseStart === null
        ? `${book.names[locale]} ${parsed.chapter}`
        : formatReference(book, parsed.chapter, parsed.verseStart, parsed.verseEnd ?? parsed.verseStart, locale);

    const data = {
      bookId: book.id,
      book_slug: book.slugs.en,
      chapter: parsed.chapter,
      verse_start: parsed.verseStart,
      verse_end: parsed.verseEnd,
      ...(version ? { version } : {}),
    };

    return {
      response: okResponse(data, { reference }),
      etag: etagFor(['v1', 'parse', 'ref', locale, book.id, parsed.chapter, parsed.verseStart ?? '', parsed.verseEnd ?? '', version ?? '']),
    };
  });
}
