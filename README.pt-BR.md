# Bible API

> 🌐 [English](./README.md) · **Português (BR)** · [Español](./README.es.md)

API pública da Bíblia, gratuita, sem chave e somente leitura. Versículos, capítulos, livros e versões
em **86 traduções bíblicas em 32 idiomas** — servidos a partir
da borda da Cloudflare com cache agressivo. Sustenta o
[api.midvash.com](https://api.midvash.com).

- **Sem chave de API, sem autenticação, sem cadastro.** É só `GET`.
- **CORS habilitado** para uso direto no navegador.
- **Conteúdo imutável**, cacheado por um ano — rápido em qualquer lugar.
- **Erros amigáveis** — typos recebem uma sugestão `didYouMean` com o slug mais próximo.
- Construído sobre Cloudflare Workers + R2.

## Endpoints

URL base: `https://api.midvash.com`

### v1 (recomendado — envelope `{ data, meta }`)

| Método | Caminho | Descrição |
|---|---|---|
| `GET` | `/v1/versions` | Lista todas as versões (`?language=en` para filtrar) |
| `GET` | `/v1/versions/{slug}` | Metadados da versão |
| `GET` | `/v1/books` | Lista todos os livros (`?testament=old\|new`) |
| `GET` | `/v1/books/{slug}` | Metadados do livro |
| `GET` | `/v1/{version}/{book}/{chapter}` | Capítulo completo (`?preview=N` trunca o `text` para tooltips) |
| `GET` | `/v1/{version}/{book}/{chapter}/{verse}` | Versículo único |
| `GET` | `/v1/{version}/{book}/{chapter}/{start}-{end}` | Intervalo de versículos |
| `GET` | `/v1/passages` | Batch: até 50 referências numa chamada (`?refs=john 3:16,psalms 23&version=kjv`) |
| `GET` | `/v1/parse` | Parseia referência em texto livre (`?q=John 3:16-18`) |
| `GET` | `/v1/votd` | Versículo do dia (`?language=&version=`) |

Contrato legível por máquinas: [`/openapi.json`](https://api.midvash.com/openapi.json)
(OpenAPI 3.1), referência interativa em [`/docs`](https://api.midvash.com/docs).

Uma API legada plana (mesmos caminhos sem o prefixo `/v1`) é mantida para
compatibilidade retroativa — os formatos de resposta ficam estáveis, e ela recebe
as mesmas melhorias de resolução da v1 (dicas `didYouMean`, slugs multilíngues).

### Exemplos

```bash
curl https://api.midvash.com/v1/versions
curl https://api.midvash.com/v1/kjv/john/3/16
curl "https://api.midvash.com/v1/kjv/john/3/16-18"
curl "https://api.midvash.com/v1/votd?language=en&version=kjv"
```

Os slugs dos livros funcionam em qualquer um dos 9 idiomas (`john`, `joao`, `juan`),
com ou sem hífen (`2-samuel` ou `2samuel`). Se um slug não resolver, o corpo do
erro sugere o mais próximo (`didYouMean`).

## Rate limit

**Não há rate limit.** Esta é uma API pública, gratuita e cacheada no edge: mais
de 99% das requisições são servidas direto do edge da Cloudflare e nunca chegam
à origem, então não emitimos `429` nem headers `X-RateLimit-*`. Os clientes não
precisam de código defensivo para 429.

Ainda assim, seja um bom cidadão: respeite `ETag`/`If-None-Match` (revalidações
retornam um `304` vazio) e agrupe várias referências numa única chamada
`GET /v1/passages?refs=...&version=...` em vez de uma requisição por referência.
Se o tráfego direto de browser um dia exigir, qualquer throttling seria aplicado
como regra de WAF no edge com headers padrão — esta seção seria atualizada primeiro.

## Desenvolvimento

```bash
npm install
npm run dev                # local
npm run dev -- --remote    # against the real R2 bucket
npm run typecheck
npm test
```

## Arquitetura

Um único Cloudflare Worker. Todo o conteúdo bíblico fica em um bucket R2; a Cache
API + as cache rules da Cloudflare absorvem 99%+ das requisições na borda, então o R2 só é
lido em um cold miss.

O pipeline de resolução de capítulo, o lookup de slugs e o ciclo de cache na borda
são cobertos por uma suíte vitest (`npm test`) que roda no CI antes de cada deploy.

O catálogo de versões (`catalog/versions.json`) é publicado no R2 pela
plataforma [Midvash](https://midvash.com) — este repo o lê em runtime e
**não tem nenhuma outra dependência externa**, então ele builda e deploya inteiramente por conta própria.

## Licença

MIT © Midvash

## O ecossistema Midvash

Faz parte do [**Midvash**](https://midvash.com) — uma plataforma gratuita de leitura e estudo bíblico. Tudo é aberto e se interliga:

| | |
|---|---|
| 📖 **Leitor (web)** | [midvash.com](https://midvash.com) — 9 idiomas |
| 📱 **App iOS** | [midvash.app/ios](https://midvash.app/ios) |
| 🔌 **API** | [api.midvash.com](https://api.midvash.com) · [`bible-api`](https://github.com/midvash/bible-api) |
| 🤖 **Servidor MCP** | [mcp.midvash.com](https://mcp.midvash.com) · [`bible-mcp`](https://github.com/midvash/bible-mcp) |
| 🧩 **Plugin WordPress** | [midvash.app/wordpress-plugin](https://midvash.app/wordpress-plugin) · [`bible-wordpress-plugin`](https://github.com/midvash/bible-wordpress-plugin) |
| 🧩 **Plugin EmDash** | [midvash.app/emdash-plugin](https://midvash.app/emdash-plugin) · [`emdash-plugin-bible`](https://github.com/midvash/emdash-plugin-bible) |
| 🌐 **Extensão Chrome** | [midvash.app/chrome-extension](https://midvash.app/chrome-extension) · [`bible-chrome-extension`](https://github.com/midvash/bible-chrome-extension) |
| 📦 **Dados abertos** | [`bible-data`](https://github.com/midvash/bible-data) · [`bible-data-js`](https://github.com/midvash/bible-data-js) · [`bible-cross-references`](https://github.com/midvash/bible-cross-references) |

<sub>Gratuito e aberto, feito pela [Midvash](https://midvash.com) · [midvash.com](https://midvash.com) · [midvash.app](https://midvash.app)</sub>
