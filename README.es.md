# Bible API

> 🌐 [English](./README.md) · [Português (BR)](./README.pt-BR.md) · **Español**

API pública de la Biblia, gratuita, sin clave y de solo lectura. Versículos, capítulos, libros y versiones
en **86 traducciones bíblicas en 32 idiomas** — servidos desde
el edge de Cloudflare con caché agresivo. Impulsa
[api.midvash.com](https://api.midvash.com).

- **Sin clave de API, sin autenticación, sin registro.** Solo `GET`.
- **CORS habilitado** para uso directo en el navegador.
- **Contenido inmutable**, cacheado por un año — rápido en todas partes.
- **Errores amigables** — los typos reciben una sugerencia `didYouMean` con el slug más cercano.
- Construido sobre Cloudflare Workers + R2.

## Endpoints

URL base: `https://api.midvash.com`

### v1 (recomendado — envoltorio `{ data, meta }`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/v1/versions` | Lista todas las versiones (`?language=en` para filtrar) |
| `GET` | `/v1/versions/{slug}` | Metadatos de la versión |
| `GET` | `/v1/books` | Lista todos los libros (`?testament=old\|new`) |
| `GET` | `/v1/books/{slug}` | Metadatos del libro |
| `GET` | `/v1/{version}/{book}/{chapter}` | Capítulo completo |
| `GET` | `/v1/{version}/{book}/{chapter}/{verse}` | Versículo único |
| `GET` | `/v1/{version}/{book}/{chapter}/{start}-{end}` | Rango de versículos |
| `GET` | `/v1/votd` | Versículo del día (`?language=&version=`) |

Una API heredada plana (mismas rutas sin el prefijo `/v1`) se mantiene para
compatibilidad retroactiva — sus formatos de respuesta quedan estables, y recibe
las mismas mejoras de resolución que v1 (sugerencias `didYouMean`, slugs multilingües).

### Ejemplos

```bash
curl https://api.midvash.com/v1/versions
curl https://api.midvash.com/v1/kjv/john/3/16
curl "https://api.midvash.com/v1/kjv/john/3/16-18"
curl "https://api.midvash.com/v1/votd?language=en&version=kjv"
```

Los slugs de los libros funcionan en cualquiera de los 9 idiomas (`john`, `joao`, `juan`),
con o sin guion (`2-samuel` o `2samuel`). Si un slug no resuelve, el cuerpo del
error sugiere el más cercano (`didYouMean`).

## Límite de tasa

**No hay límite de tasa.** Esta es una API pública, gratuita y cacheada en el
edge: más del 99% de las solicitudes se sirven directamente desde el edge de
Cloudflare y nunca llegan al origen, así que no emitimos `429` ni cabeceras
`X-RateLimit-*`. Los clientes no necesitan manejo defensivo de 429.

Aun así, sé buen ciudadano: respeta `ETag`/`If-None-Match` (las revalidaciones
devuelven un `304` vacío) y agrupa varias referencias en una sola llamada
`GET /v1/passages?refs=...&version=...` en vez de una solicitud por referencia.
Si el tráfico directo desde el navegador algún día lo exige, cualquier throttling
se aplicaría como reglas WAF en el edge con cabeceras estándar — esta sección se
actualizaría primero.

## Desarrollo

```bash
npm install
npm run dev                # local
npm run dev -- --remote    # against the real R2 bucket
npm run typecheck
npm test
```

## Arquitectura

Un único Cloudflare Worker. Todo el contenido bíblico vive en un bucket R2; la Cache
API + las cache rules de Cloudflare absorben el 99%+ de las solicitudes en el edge, así que R2 solo se
lee en un cold miss.

El pipeline de resolución de capítulos, la búsqueda de slugs y el ciclo de caché en el edge
están cubiertos por una suite de vitest (`npm test`) que corre en CI antes de cada deploy.

El catálogo de versiones (`catalog/versions.json`) es publicado en R2 por la
plataforma [Midvash](https://midvash.com) — este repo lo lee en runtime y
**no tiene ninguna otra dependencia externa**, así que se buildea y despliega enteramente por sí solo.

## Licencia

MIT © Midvash

## El ecosistema Midvash

Parte de [**Midvash**](https://midvash.com) — una plataforma gratuita de lectura y estudio bíblico. Todo es abierto y se interconecta:

| | |
|---|---|
| 📖 **Lector (web)** | [midvash.com](https://midvash.com) — 9 idiomas |
| 📱 **App iOS** | [midvash.app/ios](https://midvash.app/ios) |
| 🔌 **API** | [api.midvash.com](https://api.midvash.com) · [`bible-api`](https://github.com/midvash/bible-api) |
| 🤖 **Servidor MCP** | [mcp.midvash.com](https://mcp.midvash.com) · [`bible-mcp`](https://github.com/midvash/bible-mcp) |
| 🧩 **Plugin de WordPress** | [midvash.app/wordpress-plugin](https://midvash.app/wordpress-plugin) · [`bible-wordpress-plugin`](https://github.com/midvash/bible-wordpress-plugin) |
| 🧩 **Plugin de EmDash** | [midvash.app/emdash-plugin](https://midvash.app/emdash-plugin) · [`emdash-plugin-bible`](https://github.com/midvash/emdash-plugin-bible) |
| 🌐 **Extensión de Chrome** | [midvash.app/chrome-extension](https://midvash.app/chrome-extension) · [`bible-chrome-extension`](https://github.com/midvash/bible-chrome-extension) |
| 📦 **Datos abiertos** | [`bible-data`](https://github.com/midvash/bible-data) · [`bible-data-js`](https://github.com/midvash/bible-data-js) · [`bible-cross-references`](https://github.com/midvash/bible-cross-references) |

<sub>Gratuito y abierto, hecho por [Midvash](https://midvash.com) · [midvash.com](https://midvash.com) · [midvash.app](https://midvash.app)</sub>
