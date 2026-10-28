# Contributing

Thanks for helping. Issues and pull requests are welcome.

## Before you start

- Open an issue first for anything bigger than a small fix, so we can agree on the approach.
- The Bible text and the version catalog are published to R2 by the Midvash monorepo; this repo only
  reads them. To ask for a new version, open an issue with its source and license (public domain or
  an open license only).
- Do not break existing clients: legacy routes keep their response shape, and new fields are additive.

## Local setup

```bash
npm ci
npm run dev        # wrangler dev
npm run typecheck
npm test
```

A pull request needs `npm run typecheck` and `npm test` green. CI runs both.

## Releases

Merging to `main` deploys `api.midvash.com` through GitHub Actions. Do not deploy by hand.
