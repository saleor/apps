# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Modal/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- File names are kebab-case to match the rest of this package.
- Close uses this package's `IconButton` + Lucide `X`, with a hardcoded `"Close"` label (no
  `react-intl`).
- `ModalSteps`, `PickerHeader`, `Grid`, and `ModalSectionHeader` are not vendored — they belong to
  Dashboard pickers and multi-step assign dialogs, not the confirmation / form dialogs apps use.
  `ContextHeader` therefore has no `steps` prop.
- `ModalContext` is omitted: nothing in the vendored subset reads it.
- `onPointerDownOutside` guards `event.detail` before calling `preventDefault` on the original
  event, so a missing `detail` cannot throw.
