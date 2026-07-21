# CONTEXT.md — vocabulário de domínio da bible-api

Glossário dos conceitos do domínio e onde cada um vive. Usar estes nomes em
código, commits e discussões — não inventar sinônimos.

## Conceitos

- **Catálogo de versões** — a lista de traduções bíblicas servidas pela API,
  publicada pelo monorepo Midvash no R2 (`catalog/versions.json`). Módulo:
  `src/versions.ts` (`getVersionCatalog`). Degrada para catálogo vazio em
  falha de R2 (endpoints respondem 404, nunca 500 geral).

- **Livro** — um dos 66 livros bíblicos, com slugs em 9 locales
  (`src/books.ts`). **Lookup de livro** ("como um slug vira livro") é um
  conceito próprio: decode de URL, aliases sem hífen (`2samuel`),
  normalização frouxa e sugestão "did you mean" — tudo em
  `src/lib/book-lookup.ts` (`lookupBook`).

- **Resolução de capítulo** — o pipeline URL → conteúdo por trás das rotas
  `/{version}/{book}/{chapter}[/{verses}]` (legada e /v1):
  versão → livro → capítulo → versículos. Módulo:
  `src/lib/resolve-chapter.ts` (`resolveChapter`), retornando um resultado
  discriminado (`ok | version_not_found | book_not_found | invalid_chapter |
  chapter_not_found | verse_out_of_range`). As rotas são **serializadores**
  finos por cima: escolhem envelope e idioma da mensagem, nunca re-implementam
  resolução.

- **Envelope** — o shape do JSON de resposta. Dois convivem: **legado**
  (campos planos; erro `{ error: string, ...extras }`) e **v1**
  (`{ data, meta }`; erro `{ error: { code, message, details? } }`).
  A política de status/TTL por código de erro é uma só (`src/lib/response.ts`);
  o envelope é escolha do endpoint.

- **Ciclo de cache** — todo endpoint cacheável passa por
  `serveWithCache(request, ctx, cacheKey, label, produce)` (`src/lib/cache.ts`):
  match no edge → produce em miss → ETag/304 → put via `waitUntil` → HEAD.
  Handlers só produzem o corpo. TTL vem dos headers que `produce` coloca na
  Response.

- **Locale canônico** — a única regra de normalização de locale é
  `normalizeLocale` (`src/lib/locale.ts`): `pt`/`pt-pt` → `pt-br`,
  desconhecido → `en`. Cache key e corpo usam a mesma regra (divergência
  fragmenta o edge cache).

- **VOTD** — versículo do dia: mesma referência para todos no mesmo dia UTC,
  a partir de um pool curado (`src/lib/votd-pool.ts`), servida em `/votd` e
  `/v1/votd` (`src/handlers/votd.ts`).

## Decisões de arquitetura

- **Sem culto ao legado** (jul/2026): a API não tem usuários externos
  conhecidos além do próprio Midvash e do app iOS. Endpoints e envelopes
  legados continuam existindo, mas melhorias de comportamento (did-you-mean,
  TTL de erro por código, regra única de locale) valem para todas as
  gerações de rota.

- **Roteador declarativo: adiado.** Com os handlers enxutos pelo
  `serveWithCache`, as duas cadeias de `if`/regex (`src/index.ts` e
  `src/handlers/v1/index.ts`) ficaram pequenas e legíveis; uma tabela de
  rotas hoje só moveria complexidade. Reavaliar se o número de rotas crescer.

- **LRU de isolate não extraído.** O cache LRU dentro de
  `src/lib/chapter.ts` tem um único consumidor; extrair seria criar um seam
  hipotético (um adapter só). Promover a módulo próprio apenas quando um
  segundo consumidor real aparecer.
