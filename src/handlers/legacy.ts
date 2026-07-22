/**
 * Handlers das rotas legadas (pré-/v1), no envelope original de cada uma.
 *
 * São serializadores finos: o ciclo de cache vive em `serveWithCache`
 * (lib/cache), a resolução de conteúdo em `resolveChapter`
 * (lib/resolve-chapter) e a política de erro em `legacyErrorResponse`
 * (lib/response). Melhorias de comportamento (dica "did you mean", TTL de
 * erro por código) valem aqui também — o shape das respostas de sucesso é
 * que permanece o histórico.
 */

import { getVersionCatalog, type VersionCatalog, type VersionDefinition } from '../versions';
import { BOOKS } from '../books';
import { CACHE_HEADERS, METADATA_HEADERS, ERROR_5XX_HEADERS, type Env } from '../env';
import { normalizeLocale } from '../lib/locale';
import { etagFor, normalizeCacheKey, serveWithCache } from '../lib/cache';
import { legacyErrorResponse } from '../lib/response';
import { resolveChapter } from '../lib/resolve-chapter';

// ─── Pre-baked bodies ──────────────────────────────────────────────────────
/**
 * Root doc derivado lazy do catálogo (contagens reais de versões/idiomas em
 * vez de texto fixo que envelhece). Mesmo shape de resposta de sempre —
 * `endpoints` ganhou o /votd, que existia mas não estava documentado.
 * Memoizado por isolate apenas quando o catálogo veio com dados.
 */
interface PrebakedRoot {
  body: string;
  etag: string;
}
let prebakedRoot: PrebakedRoot | null = null;

function getPrebakedRoot(catalog: VersionCatalog): PrebakedRoot {
  if (prebakedRoot) return prebakedRoot;

  const versionCount = catalog.versions.length;
  const languageCount = new Set(catalog.versions.map((v) => v.language)).size;
  const versionsLabel = versionCount > 0 ? `${versionCount}` : 'Dezenas de';
  const languagesLabel = languageCount > 0 ? `${languageCount}` : 'vários';

  const body = JSON.stringify(
    {
      name: 'Midvash API Pública',
      version: '1.0.0',
      description: 'API pública para acesso a versículos e versões da Bíblia',
      endpoints: {
        'GET /': { description: 'Documentação da API (este endpoint)', example: 'https://api.midvash.com/' },
        'GET /versions': { description: 'Lista todas as versões bíblicas disponíveis', example: 'https://api.midvash.com/versions' },
        'GET /books': { description: 'Lista todos os livros da Bíblia', example: 'https://api.midvash.com/books' },
        'GET /votd': { description: 'Versículo do dia (query: language, version)', example: 'https://api.midvash.com/votd?language=pt-br&version=nvt' },
        'GET /{version}/{book}/{chapter}': { description: 'Retorna um capítulo completo', example: 'https://api.midvash.com/nvi/john/3' },
        'GET /{version}/{book}/{chapter}/{verse}': { description: 'Retorna um versículo específico', example: 'https://api.midvash.com/nvi/john/3/16' },
        'GET /{version}/{book}/{chapter}/{verse-start}-{verse-end}': { description: 'Retorna um intervalo de versículos', example: 'https://api.midvash.com/nvi/john/3/16-20' },
      },
      features: [
        'Cache máximo para dados imutáveis (TTL: 1 ano)',
        'CORS habilitado para acesso público',
        `Suporte a ${languagesLabel} idiomas`,
        `${versionsLabel} versões bíblicas disponíveis`,
        'Acesso rápido via Cloudflare Edge Network',
      ],
      notes: [
        'Todos os dados são imutáveis e estão em cache por 1 ano',
        'Use slugs em inglês para os livros (ex: john, genesis, psalms)',
        'A API aceita slugs de livros em diferentes idiomas',
        'Para listar versões disponíveis, acesse /versions',
        'Sem rate limit: a API é pública e cacheada no edge. Não emitimos 429 nem headers X-RateLimit-*. Respeite os ETags (304) e use /v1/passages para agrupar referências.',
      ],
    },
    null,
    2,
  );

  const result: PrebakedRoot = {
    body,
    // 'ratelimit' no seed: a lista de notes mudou sem mudar as contagens, então
    // o ETag precisa mudar para clientes não ficarem presos num 304 antigo.
    etag: etagFor(['legacy', 'root', 'ratelimit', versionCount, languageCount]),
  };
  if (versionCount > 0) prebakedRoot = result;
  return result;
}

function serializeVersionLegacy(v: VersionDefinition) {
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
 * Bodies de versões pré-serializados por isolate, derivados lazy do catálogo do
 * R2. Só memoiza quando há dados — catálogo vazio é degradação transitória.
 */
interface PrebakedLegacyVersions {
  allBody: string;
  byLocale: Record<string, string>;
  listEtag: string;
}
let prebakedVersions: PrebakedLegacyVersions | null = null;

function getPrebakedVersions(catalog: VersionCatalog): PrebakedLegacyVersions {
  if (prebakedVersions) return prebakedVersions;

  const allBody = JSON.stringify({ versions: catalog.versions.map(serializeVersionLegacy) });

  const byLocale: Record<string, string> = {};
  // Agrupa pela mesma regra canônica de locale do resto da API (pt-pt → pt-br).
  const langs = new Set(catalog.versions.map((v) => normalizeLocale(v.language)));
  for (const lang of langs) {
    const filtered = catalog.versions
      .filter((v) => normalizeLocale(v.language) === lang)
      .map(serializeVersionLegacy);
    byLocale[lang] = JSON.stringify({ versions: filtered });
  }

  const result: PrebakedLegacyVersions = {
    allBody,
    byLocale,
    listEtag: etagFor(['legacy', 'versions', catalog.versions.length]),
  };
  if (catalog.versions.length > 0) prebakedVersions = result;
  return result;
}

const BOOKS_BODY = JSON.stringify({
  books: BOOKS.map((book) => ({
    id: book.id,
    name: book.names,
    slug: book.slugs,
    abbrev: book.abbrev,
    chapters: book.chapters,
    testament: book.testament,
    category: book.category,
  })),
});
const BOOKS_ETAG = etagFor(['legacy', 'books', BOOKS.length]);

// ─── GET / ────────────────────────────────────────────────────────────────
export function handleRoot(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'root', async () => {
    const root = getPrebakedRoot(await getVersionCatalog(env));
    // Vary: Accept — `/` também serve a landing HTML; ver comentário no index.
    return {
      response: new Response(root.body, { headers: { ...METADATA_HEADERS, Vary: 'Accept' } }),
      etag: root.etag,
    };
  });
}

// ─── GET /versions ────────────────────────────────────────────────────────
export function handleVersions(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'versions', async () => {
    const { allBody, byLocale, listEtag } = getPrebakedVersions(await getVersionCatalog(env));

    const localeParam = new URL(request.url).searchParams.get('locale');
    if (!localeParam) {
      return { response: new Response(allBody, { headers: CACHE_HEADERS }), etag: listEtag };
    }

    const normalizedLocale = normalizeLocale(localeParam);
    const body = byLocale[normalizedLocale] ?? JSON.stringify({ versions: [] });
    return {
      response: new Response(body, { headers: CACHE_HEADERS }),
      etag: etagFor(['legacy', 'versions', normalizedLocale]),
    };
  });
}

// ─── GET /books ───────────────────────────────────────────────────────────
export function handleBooks(request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> {
  return serveWithCache(request, ctx, normalizeCacheKey(request), 'books', () => ({
    response: new Response(BOOKS_BODY, { headers: CACHE_HEADERS }),
    etag: BOOKS_ETAG,
  }));
}

// ─── GET /{version}/{book}/{chapter}[/{verse}] ────────────────────────────
export function handleVerse(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  match: RegExpMatchArray,
): Promise<Response> {
  const [, version, book, chapter, verseParam] = match;

  return serveWithCache(request, ctx, normalizeCacheKey(request), 'verse', async () => {
    try {
      const r = await resolveChapter(env, version, book, chapter, verseParam);

      switch (r.kind) {
        case 'version_not_found':
          return legacyErrorResponse(
            'VERSION_NOT_FOUND',
            r.didYouMean
              ? `Versão não encontrada: ${version}. Você quis dizer "${r.didYouMean}"?`
              : `Versão não encontrada: ${version}`,
            r.didYouMean ? { didYouMean: r.didYouMean } : undefined,
          );
        case 'book_not_found':
          return legacyErrorResponse(
            'BOOK_NOT_FOUND',
            r.didYouMean
              ? `Livro não encontrado: ${book}. Você quis dizer "${r.didYouMean}"?`
              : `Livro não encontrado: ${book}`,
            r.didYouMean ? { didYouMean: r.didYouMean } : undefined,
          );
        case 'invalid_chapter':
          return legacyErrorResponse(
            'INVALID_PARAMS',
            `Capítulo inválido: ${chapter}. O livro ${r.book.names['en']} tem ${r.book.chapters} capítulos.`,
          );
        case 'chapter_not_found':
          return legacyErrorResponse(
            'CHAPTER_NOT_FOUND',
            `Capítulo não encontrado: ${r.book.names['en']} ${r.chapterNum}`,
          );
        case 'verse_out_of_range': {
          const requested =
            r.range.start === r.range.end
              ? `versículo ${r.range.start}`
              : `versículos ${r.range.start}-${r.range.end}`;
          return legacyErrorResponse(
            'VERSE_NOT_FOUND',
            `Versículo(s) não encontrado(s). O capítulo ${r.chapterNum} tem ${r.maxVerses} versículos.`,
            { chapter: r.chapterNum, maxVerses: r.maxVerses, requested },
          );
        }
      }

      // Sucesso — envelope legado (campos planos).
      const bookName = r.book.names['en'];
      if (!r.selection) {
        return {
          response: new Response(
            JSON.stringify({
              version: r.versionSlug,
              book,
              bookName,
              chapter: r.chapterNum,
              verses: r.verses,
            }),
            { headers: CACHE_HEADERS },
          ),
          etag: etagFor(['legacy', r.versionSlug, r.book.id, r.chapterNum]),
        };
      }

      return {
        response: new Response(
          JSON.stringify({
            version: r.versionSlug,
            book,
            bookName,
            chapter: r.chapterNum,
            verse: r.selection.range.start,
            verseEnd: r.selection.range.end,
            text: r.selection.text,
            reference: r.selection.reference,
          }),
          { headers: CACHE_HEADERS },
        ),
        etag: etagFor([
          'legacy',
          r.versionSlug,
          r.book.id,
          r.chapterNum,
          r.selection.range.start,
          r.selection.range.end,
        ]),
      };
    } catch (error) {
      console.error('[API] Error:', error);
      return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
        status: 500,
        headers: ERROR_5XX_HEADERS,
      });
    }
  });
}
