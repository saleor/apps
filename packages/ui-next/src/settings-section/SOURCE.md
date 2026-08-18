# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Settings/SettingsSection.tsx` (+ `.module.css`)
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Optional `headerEnd` for section actions (e.g. “Add configuration”) — Dashboard puts
  most actions in body rows; apps often need a header CTA.
- Optional `SettingsFieldStack` sibling for padded body content.
- Description `max-width: 75%` (not Dashboard’s fixed rem) so copy stays short of
  the header action column on wide cards.
