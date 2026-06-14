# Bible API

> 🌐 [English](./README.md) · **Português (BR)** · [Español](./README.es.md)

API pública da Bíblia, gratuita, sem chave e somente leitura. Versículos, capítulos, livros e versões
em **86 traduções bíblicas em 32 idiomas** — servidos a partir
da borda da Cloudflare com cache agressivo. Sustenta o
[api.midvash.com](https://api.midvash.com).

- **Sem chave de API, sem autenticação, sem cadastro.** É só `GET`.
- **CORS habilitado** para uso direto no navegador.
- **Conteúdo imutável**, cacheado por um ano — rápido em qualquer lugar.
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
| `GET` | `/v1/{version}/{book}/{chapter}` | Capítulo completo |
| `GET` | `/v1/{version}/{book}/{chapter}/{verse}` | Versículo único |
| `GET` | `/v1/{version}/{book}/{chapter}/{start}-{end}` | Intervalo de versículos |
| `GET` | `/v1/votd` | Versículo do dia (`?language=&version=`) |

Uma API legada plana (mesmos caminhos sem o prefixo `/v1`) é mantida congelada para
compatibilidade retroativa.

### Exemplos

```bash
curl https://api.midvash.com/v1/versions
curl https://api.midvash.com/v1/kjv/john/3/16
curl "https://api.midvash.com/v1/kjv/john/3/16-18"
curl "https://api.midvash.com/v1/votd?language=en&version=kjv"
```

Os slugs dos livros são em inglês (`john`, `genesis`, `psalms`).

## Desenvolvimento

```bash
npm install
npm run dev                # local
npm run dev -- --remote    # against the real R2 bucket
npm run typecheck
```

## Arquitetura

Um único Cloudflare Worker. Todo o conteúdo bíblico fica em um bucket R2; a Cache
API + as cache rules da Cloudflare absorvem 99%+ das requisições na borda, então o R2 só é
lido em um cold miss.

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
