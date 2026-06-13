# Bible API

Free, no-key, read-only public Bible API. Verses, chapters, books and versions
across **80+ public-domain translations in 30+ languages** — served from
Cloudflare's edge with aggressive caching. Powers
[api.midvash.com](https://api.midvash.com).

- **No API key, no auth, no signup.** Just `GET`.
- **CORS enabled** for direct browser use.
- **Immutable content**, cached for a year — fast everywhere.
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
| `GET` | `/v1/{version}/{book}/{chapter}` | Full chapter |
| `GET` | `/v1/{version}/{book}/{chapter}/{verse}` | Single verse |
| `GET` | `/v1/{version}/{book}/{chapter}/{start}-{end}` | Verse range |
| `GET` | `/v1/votd` | Verse of the day (`?language=&version=`) |

A legacy flat API (same paths without the `/v1` prefix) is kept frozen for
backward compatibility.

### Examples

```bash
curl https://api.midvash.com/v1/versions
curl https://api.midvash.com/v1/kjv/john/3/16
curl "https://api.midvash.com/v1/kjv/john/3/16-18"
curl "https://api.midvash.com/v1/votd?language=en&version=kjv"
```

Book slugs are in English (`john`, `genesis`, `psalms`).

## Development

```bash
npm install
npm run dev                # local
npm run dev -- --remote    # against the real R2 bucket
npm run typecheck
```

## Architecture

A single Cloudflare Worker. All Bible content lives in an R2 bucket; the Cache
API + Cloudflare cache rules absorb 99%+ of requests at the edge, so R2 is only
read on a cold miss.

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
