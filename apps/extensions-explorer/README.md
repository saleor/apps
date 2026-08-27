<div align="center">
  <h1>Saleor Extensions Explorer</h1>
  <p>A playground for Saleor Dashboard extensions.</p>
</div>

Compose any set of Dashboard extensions in the browser, copy the generated manifest URL and install
it in Saleor. Every extension renders a placeholder that shows the context Saleor passed to it.

The app is frontend only. It has no `tokenTargetUrl`, so Saleor installs it without exchanging an
auth token, and it stores nothing.

## How it works

- `/` - the configurator. Pick presets, tweak mount / target / options per row, copy the manifest
  URL. The page URL is kept in sync, so a configuration can be shared or reopened.
- `/api/manifest?c=<base64url>` - the manifest, fully driven by the `c` query param. Without it, a
  default preset is served. Extensions that don't pass validation are dropped.
- `/placeholder` and `/api/placeholder` - the GET and POST targets every extension points at.

The configurator only offers combinations Saleor Dashboard accepts (e.g. `WIDGET` is unavailable on
mounts without a widget slot, `views` and `aliases` only on `SEARCH_ACTION`). The rules live in
`src/extensions/domain.ts` and mirror Dashboard's `src/extensions/domain/*` zod schemas.

## Development

Saleor must be able to reach the app, so use a tunnel or set `APP_IFRAME_BASE_URL` /
`APP_API_BASE_URL` (see `.env.example`).

```bash
pnpm --filter saleor-app-extensions-explorer dev
pnpm --filter saleor-app-extensions-explorer test    # domain rules
pnpm --filter saleor-app-extensions-explorer check-types
pnpm --filter saleor-app-extensions-explorer lint
```
