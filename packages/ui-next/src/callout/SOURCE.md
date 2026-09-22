# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Callout/Callout.tsx` + `Callout.module.css`
- **Commit:** `696b6ccf5cbd1c4d25d04aba5b7a3b615a5fec3a`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`; icons via this package's
  shared `iconSize` / `iconStrokeWidthBySize`.
- No `messages.ts`. Upstream re-exports `commonMessages.info` / `.warning` as default titles;
  callers here own their copy (see the i18n contract in ADR 0004).
- `clsx` for the class merge instead of the inline `filter(Boolean).join(" ")`.
- Extra `action` prop: one control on the trailing edge. Upstream callouts are read-only because
  Dashboard sections always have the fixing control nearby; an app that reports "this email is
  turned off" has nowhere else to put the switch that turns it on.
