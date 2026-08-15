# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Layouts/Detail/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Height model adapted for iframe-mounted apps: default is flexible (`min-height: 100%`) rather than Dashboard’s `100vh - savebarHeight - borders` calc. Pass `withSavebar` only to reserve bottom padding for a sticky `Savebar`.
- Does not depend on Dashboard `hide-scrollbar` / `mobile-full-height` global CSS classes; scrollbar hiding is optional via CSS module.
