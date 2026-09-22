# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/DetailSettingToggleRow/DetailSettingToggleRow.tsx` +
  `DetailSettingToggleRow.module.css`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- None of substance: markup, keyboard handling and CSS are the upstream ones, with macaw imported
  from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- The single tab stop is upstream's, and worth keeping: the copy block is the `role="button"`
  (descriptions there contain pills, which are `div`s, so a real `<button>` would nest interactive
  content), and the `Toggle` is `aria-hidden` with `tabIndex={-1}` so the row is one stop rather
  than two controls for one setting.
- Rows draw their own bottom separator and drop it on `:last-child`, so a stack of them works as the
  flush body of a `SettingsSection` or a `DetailGroupBox` with no wrapper.
