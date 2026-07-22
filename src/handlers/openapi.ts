/**
 * GET /openapi.json — spec OpenAPI 3.1 da API pública (v1).
 * GET /docs         — referência interativa (Scalar) por cima do spec.
 *
 * O spec é o contrato vivo lido por máquinas (o discovery GET /v1 continua
 * existindo como resumo). Pre-baked no module scope: objeto → stringify uma
 * vez por isolate; ETag derivado do próprio corpo (FNV-1a), então qualquer
 * edição aqui invalida 304s automaticamente — sem bump manual de constante.
 *
 * Rotas legadas (/{version}/{book}/{chapter} sem /v1) ficam FORA do spec de
 * propósito: são congeladas e não queremos novos consumidores nelas.
 */

import type { Env } from '../env';
import { HTML_HEADERS, METADATA_HEADERS } from '../env';
import { buildCacheKey, etagFor, serveWithCache } from '../lib/cache';

// ─── Schemas reutilizados ───────────────────────────────────────────────────

const ERROR_SCHEMA = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: {
          type: 'string',
          enum: [
            'NOT_FOUND',
            'INVALID_PARAMS',
            'INTERNAL_ERROR',
            'VERSION_NOT_FOUND',
            'BOOK_NOT_FOUND',
            'CHAPTER_NOT_FOUND',
            'VERSE_NOT_FOUND',
          ],
        },
        message: { type: 'string' },
        details: { description: 'Contexto extra opcional (ex.: didYouMean, maxVerses).' },
      },
    },
  },
} as const;

const LOCALIZED_STRINGS_SCHEMA = {
  type: 'object',
  description: 'Strings por locale (en, pt-br, es, …).',
  additionalProperties: { type: 'string' },
} as const;

const VERSION_SCHEMA = {
  type: 'object',
  required: [
    'slug',
    'name',
    'shortName',
    'language',
    'hasOldTestament',
    'hasNewTestament',
    'totalBooks',
    'totalChapters',
  ],
  properties: {
    slug: { type: 'string', examples: ['naa', 'kjv', 'nvies'] },
    name: { type: 'string' },
    shortName: { type: 'string' },
    language: { type: 'string', examples: ['pt', 'en', 'es'] },
    hasOldTestament: { type: 'boolean' },
    hasNewTestament: { type: 'boolean' },
    totalBooks: { type: 'integer' },
    totalChapters: { type: 'integer' },
    localizedNames: { ...LOCALIZED_STRINGS_SCHEMA },
    copyright: { type: 'string' },
  },
} as const;

const BOOK_SCHEMA = {
  type: 'object',
  required: ['name', 'slug', 'abbrev', 'chapters', 'testament'],
  properties: {
    name: { ...LOCALIZED_STRINGS_SCHEMA },
    slug: { ...LOCALIZED_STRINGS_SCHEMA },
    abbrev: { ...LOCALIZED_STRINGS_SCHEMA },
    chapters: { type: 'integer' },
    testament: { type: 'string', enum: ['old', 'new'] },
  },
} as const;

/**
 * Shape unificado de conteúdo bíblico — versículo, intervalo e capítulo
 * inteiro compartilham os mesmos campos (capítulo = verse: 1 até o último).
 */
const PASSAGE_DATA_SCHEMA = {
  type: 'object',
  required: ['version', 'book', 'bookName', 'chapter', 'verse', 'verseEnd', 'text'],
  properties: {
    version: { type: 'string' },
    book: { type: 'string', description: 'Slug canônico em inglês.' },
    bookName: { type: 'string' },
    chapter: { type: 'integer' },
    verse: { type: 'integer', description: 'Primeiro versículo retornado (1 em capítulo inteiro).' },
    verseEnd: { type: 'integer', description: 'Último versículo retornado.' },
    text: { type: 'string', description: 'Versículos selecionados unidos por espaço.' },
    verses: {
      type: 'array',
      items: { type: 'string' },
      description: 'Um item por versículo. Omitido quando `?preview=` é usado.',
    },
  },
} as const;

const PASSAGE_META_SCHEMA = {
  type: 'object',
  properties: {
    reference: { type: 'string', examples: ['John 3:16-18', 'Psalms 23'] },
    total: { type: 'integer', description: 'Total de versículos do capítulo/seleção.' },
    truncated: {
      type: 'boolean',
      description: 'Presente só com `?preview=`: true se o texto foi truncado.',
    },
  },
} as const;

// ─── Spec ───────────────────────────────────────────────────────────────────

const errorResponses = (codes: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(codes).map(([status, description]) => [
      status,
      {
        description,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    ]),
  );

const jsonOk = (description: string, schema: unknown) => ({
  '200': { description, content: { 'application/json': { schema } } },
});

const envelope = (dataSchema: unknown, metaSchema?: unknown) => ({
  type: 'object',
  required: ['data'],
  properties: metaSchema ? { data: dataSchema, meta: metaSchema } : { data: dataSchema },
});

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'Midvash API',
    version: '1.0.0',
    summary: 'Free, no-key public Bible API',
    description:
      'Versículos, capítulos, versões e livros em 80+ traduções de domínio público. ' +
      'Sem autenticação, sem rate limit, CORS aberto, edge-cached (honre ETag/304). ' +
      'Sucesso usa envelope `{ data, meta? }`; erro usa `{ error: { code, message, details? } }`. ' +
      'Respostas de conteúdo bíblico são imutáveis (`Cache-Control: public, max-age=31536000, immutable`) ' +
      'e trazem `ETag` estável — envie `If-None-Match` para receber 304 sem corpo.',
    license: { name: 'MIT', url: 'https://github.com/midvash/bible-api/blob/main/LICENSE' },
  },
  servers: [{ url: 'https://api.midvash.com' }],
  paths: {
    '/v1': {
      get: {
        operationId: 'getDiscovery',
        summary: 'Discovery de endpoints',
        responses: jsonOk('Lista de endpoints e política de rate limit.', {
          type: 'object',
          required: ['data'],
        }),
      },
    },
    '/v1/versions': {
      get: {
        operationId: 'listVersions',
        summary: 'Lista versões da Bíblia',
        parameters: [
          {
            name: 'language',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filtra por código de idioma (ex.: pt, en, es).',
          },
        ],
        responses: jsonOk(
          'Versões disponíveis.',
          envelope(
            { type: 'array', items: { $ref: '#/components/schemas/Version' } },
            { type: 'object', properties: { total: { type: 'integer' }, language: { type: 'string' } } },
          ),
        ),
      },
    },
    '/v1/versions/{slug}': {
      get: {
        operationId: 'getVersion',
        summary: 'Detalhe de uma versão',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          ...jsonOk('Versão encontrada.', envelope({ $ref: '#/components/schemas/Version' })),
          ...errorResponses({ '404': 'VERSION_NOT_FOUND (com didYouMean quando há sugestão).' }),
        },
      },
    },
    '/v1/books': {
      get: {
        operationId: 'listBooks',
        summary: 'Lista os 66 livros (nomes/slugs/abreviações multilíngues)',
        parameters: [
          {
            name: 'testament',
            in: 'query',
            schema: { type: 'string', enum: ['old', 'new'] },
          },
        ],
        responses: jsonOk(
          'Livros.',
          envelope(
            { type: 'array', items: { $ref: '#/components/schemas/Book' } },
            { type: 'object', properties: { total: { type: 'integer' }, testament: { type: 'string' } } },
          ),
        ),
      },
    },
    '/v1/books/{slug}': {
      get: {
        operationId: 'getBook',
        summary: 'Detalhe de um livro (slug em qualquer locale suportado)',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          ...jsonOk('Livro encontrado.', envelope({ $ref: '#/components/schemas/Book' })),
          ...errorResponses({ '404': 'BOOK_NOT_FOUND (com didYouMean quando há sugestão).' }),
        },
      },
    },
    '/v1/{version}/{book}/{chapter}': {
      get: {
        operationId: 'getChapter',
        summary: 'Capítulo inteiro',
        description:
          'Mesmo shape do endpoint de versículo (`verse: 1`, `verseEnd` = último, `text` = capítulo ' +
          'inteiro), mais `verses[]`. Com `?preview=N` o `text` é truncado em ~N caracteres ' +
          '(terminando em fim de versículo), `verses[]` é omitido e `meta.truncated` indica corte.',
        parameters: [
          { name: 'version', in: 'path', required: true, schema: { type: 'string' }, example: 'naa' },
          { name: 'book', in: 'path', required: true, schema: { type: 'string' }, example: 'psalms' },
          { name: 'chapter', in: 'path', required: true, schema: { type: 'integer' }, example: 23 },
          {
            name: 'preview',
            in: 'query',
            schema: { type: 'integer', minimum: 40, maximum: 2000 },
            description: 'Trunca `text` em ~N caracteres (clampado em [40, 2000]). Inválido = ignorado.',
          },
        ],
        responses: {
          ...jsonOk(
            'Capítulo.',
            envelope(
              { $ref: '#/components/schemas/PassageData' },
              { $ref: '#/components/schemas/PassageMeta' },
            ),
          ),
          ...errorResponses({
            '400': 'INVALID_PARAMS (capítulo fora do range do livro).',
            '404': 'VERSION_NOT_FOUND | BOOK_NOT_FOUND | CHAPTER_NOT_FOUND.',
          }),
        },
      },
    },
    '/v1/{version}/{book}/{chapter}/{verse}': {
      get: {
        operationId: 'getVerse',
        summary: 'Versículo único ("16") ou intervalo ("16-20")',
        parameters: [
          { name: 'version', in: 'path', required: true, schema: { type: 'string' }, example: 'naa' },
          { name: 'book', in: 'path', required: true, schema: { type: 'string' }, example: 'john' },
          { name: 'chapter', in: 'path', required: true, schema: { type: 'integer' }, example: 3 },
          { name: 'verse', in: 'path', required: true, schema: { type: 'string' }, example: '16-18' },
        ],
        responses: {
          ...jsonOk(
            'Versículo(s).',
            envelope(
              { $ref: '#/components/schemas/PassageData' },
              { $ref: '#/components/schemas/PassageMeta' },
            ),
          ),
          ...errorResponses({
            '404': 'VERSION_NOT_FOUND | BOOK_NOT_FOUND | CHAPTER_NOT_FOUND | VERSE_NOT_FOUND.',
          }),
        },
      },
    },
    '/v1/passages': {
      get: {
        operationId: 'getPassages',
        summary: 'Batch: até 50 referências numa chamada',
        description:
          'Uma ref inválida não derruba o batch — vira `{ ref, error }` na sua posição. ' +
          'A ordem do array espelha o input. Versão inválida derruba o batch inteiro (404).',
        parameters: [
          {
            name: 'refs',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'john 3:16,genesis 1:1-3,psalms 23',
            description: 'Referências em texto livre, separadas por vírgula (máx. 50).',
          },
          { name: 'version', in: 'query', required: true, schema: { type: 'string' }, example: 'kjv' },
        ],
        responses: {
          ...jsonOk(
            'Itens na ordem do input.',
            envelope(
              { type: 'array', items: { $ref: '#/components/schemas/PassageItem' } },
              {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  version: { type: 'string' },
                  resolved: { type: 'integer' },
                  failed: { type: 'integer' },
                },
              },
            ),
          ),
          ...errorResponses({
            '400': 'INVALID_PARAMS (refs/version ausentes ou mais de 50 refs).',
            '404': 'VERSION_NOT_FOUND.',
          }),
        },
      },
    },
    '/v1/parse': {
      get: {
        operationId: 'parseReference',
        summary: 'Oráculo: parseia referência em texto livre',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'João 3:16-18',
          },
          {
            name: 'version',
            in: 'query',
            schema: { type: 'string' },
            description: 'Opcional; se passada, é validada e ecoada.',
          },
        ],
        responses: {
          ...jsonOk(
            'Referência parseada (capítulo inteiro → verse_start/verse_end nulos).',
            envelope({
              type: 'object',
              required: ['bookId', 'book_slug', 'chapter', 'verse_start', 'verse_end'],
              properties: {
                bookId: { type: 'integer' },
                book_slug: { type: 'string' },
                chapter: { type: 'integer' },
                verse_start: { type: ['integer', 'null'] },
                verse_end: { type: ['integer', 'null'] },
                version: { type: 'string' },
              },
            }),
          ),
          ...errorResponses({
            '400': 'INVALID_PARAMS (q ausente ou não parseável).',
            '404': 'BOOK_NOT_FOUND | VERSION_NOT_FOUND.',
          }),
        },
      },
    },
    '/v1/votd': {
      get: {
        operationId: 'getVerseOfTheDay',
        summary: 'Versículo do dia (mesmo versículo para todos num dia UTC)',
        parameters: [
          { name: 'locale', in: 'query', schema: { type: 'string' }, example: 'pt-br' },
          { name: 'version', in: 'query', schema: { type: 'string' } },
        ],
        responses: jsonOk('Versículo do dia (envelope legado, sem { data }).', {
          type: 'object',
          required: ['reference', 'text', 'version', 'book_slug', 'chapter', 'verse_start', 'verse_end', 'url'],
          properties: {
            reference: { type: 'string' },
            text: { type: 'string' },
            version: { type: 'string' },
            book_slug: { type: 'string' },
            chapter: { type: 'integer' },
            verse_start: { type: 'integer' },
            verse_end: { type: 'integer' },
            url: { type: 'string' },
          },
        }),
      },
    },
  },
  components: {
    schemas: {
      Error: ERROR_SCHEMA,
      Version: VERSION_SCHEMA,
      Book: BOOK_SCHEMA,
      PassageData: PASSAGE_DATA_SCHEMA,
      PassageMeta: PASSAGE_META_SCHEMA,
      PassageItem: {
        oneOf: [
          {
            allOf: [
              { $ref: '#/components/schemas/PassageData' },
              {
                type: 'object',
                required: ['ref', 'reference'],
                properties: { ref: { type: 'string' }, reference: { type: 'string' } },
              },
            ],
          },
          {
            type: 'object',
            required: ['ref', 'error'],
            properties: { ref: { type: 'string' }, error: { type: 'string' } },
          },
        ],
      },
    },
  },
} as const;

const OPENAPI_BODY = JSON.stringify(OPENAPI_SPEC);

// FNV-1a do corpo — mesmo truque da landing: mudou o spec, mudou o ETag.
function fnv(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const OPENAPI_ETAG = etagFor(['openapi', fnv(OPENAPI_BODY)]);

// /docs — Scalar por CDN em cima do /openapi.json. Página estática mínima;
// a referência em si é renderizada no cliente.
const DOCS_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Midvash API — Reference</title>
<meta name="description" content="OpenAPI reference for the free, no-key public Bible API at api.midvash.com.">
</head>
<body>
<script id="api-reference" data-url="/openapi.json"></script>
<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
`;
const DOCS_ETAG = etagFor(['docs', fnv(DOCS_HTML)]);

export function handleOpenApiJson(
  request: Request,
  _env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  return serveWithCache(request, ctx, buildCacheKey({ endpoint: 'openapi' }), 'openapi', () => ({
    // METADATA_HEADERS (1 dia): o spec evolui com deploys, não é imutável.
    response: new Response(OPENAPI_BODY, { headers: METADATA_HEADERS }),
    etag: OPENAPI_ETAG,
  }));
}

export function handleDocs(request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> {
  return serveWithCache(request, ctx, buildCacheKey({ endpoint: 'docs' }), 'docs', () => ({
    response: new Response(DOCS_HTML, { headers: HTML_HEADERS }),
    etag: DOCS_ETAG,
  }));
}
