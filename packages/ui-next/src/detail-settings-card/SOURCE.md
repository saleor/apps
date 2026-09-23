# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/DetailSettingsCard/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- `DetailSettingsOptionalLabel` takes a `children: ReactNode` prop instead of hardcoding `FormattedMessage` / `react-intl`.
- `coerceHeaderEndActions` only coerces macaw `Button` size; Dashboard’s `ButtonGroupWithDropdown` is not available in apps.
- `DetailSettingsCardIntro` wraps its children in `Text size={3} color="default2"`. Upstream leaves the slot bare and every caller (`ChannelPaymentGatewaysSection`, `VoucherCodesCard`, `ExtensionPreferencesSection`, `AssignListCard`) adds that same `Text`; owning it here, the way the card already owns the title's typography, means a bare string cannot fall back to body type.
- `title` is optional. With no title, subtitle, or headerEnd the header band is omitted — a facts-only rail card should not spend a row on a heading.
- `variant="secondary"` flattens the header band to the body fill. `className` is the composition hook for emphasis (`detailSettingsCardStyles.elevated`).
