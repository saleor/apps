# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/DetailSettingsCard/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- `DetailSettingsOptionalLabel` takes a `children: ReactNode` prop instead of hardcoding `FormattedMessage` / `react-intl`.
- `coerceHeaderEndActions` only coerces macaw `Button` size; Dashboard’s `ButtonGroupWithDropdown` is not available in apps.
