# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/AssignListCard/AssignListCard.tsx` empty state + `AssignListCard.module.css` (`.emptyState`, `.emptyLeading`, `.emptyIcon`, `.emptyCopy`, `.emptyAction`)
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Standalone callout (not the full AssignListCard). Caller supplies icon, copy, and action.
- No `react-intl`.
