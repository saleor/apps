# Upstream source

- **Repo:** saleor-dashboard
- **Path:** Pattern from `src/components/DeletableItem/DeletableItem.tsx` (tertiary Macaw icon button + Lucide at `iconSize.small`)
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Generic `IconButton` — caller supplies the Lucide (or other) icon node; not trash-specific.
- Default `size="small"` for denser app settings chrome (Dashboard DeletableItem omits size).
