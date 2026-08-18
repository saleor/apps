# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/DetailGroupBox/DetailGroupBox.tsx` + `DetailGroupBox.module.css`
- **Commit:** `bd32cb2dea845e12dde98a18a734d53f070cb6e6`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Icons via shared `iconSize` / `iconStrokeWidthBySize` from this package.
- No Dashboard-only test wrapper; vitest + Testing Library only.
- Extra `flush` variant: full-bleed fold inside a parent settings card (no own
  border/radius). Dashboard embeds folds as nested bordered `primary` groups or
  standalone `secondary` cards; apps use `flush` to avoid stacked boxes.
