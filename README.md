# Bible API

> 🌐 **English** · [Português (BR)](./README.pt-BR.md) · [Español](./README.es.md)

Free, no-key, read-only public Bible API. Verses, chapters, books and versions
across **86 Bible translations in 32 languages** — served from
Cloudflare's edge with aggressive caching. Powers
[api.midvash.com](https://api.midvash.com).

- **No API key, no auth, no signup.** Just `GET`.
- **CORS enabled** for direct browser use.
- **Immutable content**, cached for a year — fast everywhere.
- **Friendly errors** — typos get a `didYouMean` suggestion with the closest slug.
- Built on Cloudflare Workers + R2.

## Endpoints

Base URL: `https://api.midvash.com`

### v1 (recommended — `{ data, meta }` envelope)

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/versions` | List all versions (`?language=en` to filter) |
| `GET` | `/v1/versions/{slug}` | Version metadata |
| `GET` | `/v1/books` | List all books (`?testament=old\|new`) |
| `GET` | `/v1/books/{slug}` | Book metadata |
| `GET` | `/v1/{version}/{book}/{chapter}` | Full chapter (`?preview=N` truncates `text` for tooltips) |
| `GET` | `/v1/{version}/{book}/{chapter}/{verse}` | Single verse |
| `GET` | `/v1/{version}/{book}/{chapter}/{start}-{end}` | Verse range |
| `GET` | `/v1/passages` | Batch: up to 50 references in one call (`?refs=john 3:16,psalms 23&version=kjv`) |
| `GET` | `/v1/parse` | Parse a free-text reference (`?q=John 3:16-18`) |
| `GET` | `/v1/votd` | Verse of the day (`?language=&version=`) |

Machine-readable contract: [`/openapi.json`](https://api.midvash.com/openapi.json)
(OpenAPI 3.1), interactive reference at [`/docs`](https://api.midvash.com/docs).

A legacy flat API (same paths without the `/v1` prefix) is kept for backward
compatibility — its response shapes stay stable, and it gets the same resolution
improvements as v1 (`didYouMean` hints, multilingual slugs).

### Examples

```bash
curl https://api.midvash.com/v1/versions
curl https://api.midvash.com/v1/kjv/john/3/16
curl "https://api.midvash.com/v1/kjv/john/3/16-18"
curl "https://api.midvash.com/v1/votd?language=en&version=kjv"
```

Book slugs work in any of 9 languages (`john`, `joao`, `juan`), with or without
hyphens (`2-samuel` or `2samuel`). If a slug doesn't resolve, the error body
suggests the closest one (`didYouMean`).

## Rate limiting

**There is no rate limit.** This is a free, public, edge-cached API: over 99% of
requests are served straight from the Cloudflare edge and never reach the
origin, so we don't emit `429` or `X-RateLimit-*` headers. Clients don't need
defensive 429 handling.

Please be a good citizen anyway: honor `ETag`/`If-None-Match` (revalidations
return an empty `304`), and batch multiple references into a single
`GET /v1/passages?refs=...&version=...` call instead of one request per
reference. If direct-from-browser traffic ever forces our hand, any throttling
would be applied as edge WAF rules with standard headers — this section will be
updated first.

## Development

```bash
npm install
npm run dev                # local
npm run dev -- --remote    # against the real R2 bucket
npm run typecheck
npm test
```

## Architecture

A single Cloudflare Worker. All Bible content lives in an R2 bucket; the Cache
API + Cloudflare cache rules absorb 99%+ of requests at the edge, so R2 is only
read on a cold miss.

The chapter-resolution pipeline, slug lookup and edge-cache cycle are covered
by a vitest suite (`npm test`) that runs in CI before every deploy.

The version catalog (`catalog/versions.json`) is published to R2 by the
[Midvash](https://midvash.com) platform — this repo reads it at runtime and has
**no other external dependency**, so it builds and deploys entirely on its own.

## License

MIT © Midvash

## The Midvash ecosystem

Part of [**Midvash**](https://midvash.com) — a free Bible reading & study platform. Everything is open and interlinks:

| | |
|---|---|
| 📖 **Reader (web)** | [midvash.com](https://midvash.com) — 9 languages |
| 📱 **iOS app** | [midvash.app/ios](https://midvash.app/ios) |
| 🔌 **API** | [api.midvash.com](https://api.midvash.com) · [`bible-api`](https://github.com/midvash/bible-api) |
| 🤖 **MCP server** | [mcp.midvash.com](https://mcp.midvash.com) · [`bible-mcp`](https://github.com/midvash/bible-mcp) |
| 🧩 **WordPress plugin** | [midvash.app/wordpress-plugin](https://midvash.app/wordpress-plugin) · [`bible-wordpress-plugin`](https://github.com/midvash/bible-wordpress-plugin) |
| 🧩 **EmDash plugin** | [midvash.app/emdash-plugin](https://midvash.app/emdash-plugin) · [`emdash-plugin-bible`](https://github.com/midvash/emdash-plugin-bible) |
| 🌐 **Chrome extension** | [midvash.app/chrome-extension](https://midvash.app/chrome-extension) · [`bible-chrome-extension`](https://github.com/midvash/bible-chrome-extension) |
| 📦 **Open data** | [`bible-data`](https://github.com/midvash/bible-data) · [`bible-data-js`](https://github.com/midvash/bible-data-js) · [`bible-cross-references`](https://github.com/midvash/bible-cross-references) |

<sub>Free & open, built by [Midvash](https://midvash.com) · [midvash.com](https://midvash.com) · [midvash.app](https://midvash.app)</sub>

