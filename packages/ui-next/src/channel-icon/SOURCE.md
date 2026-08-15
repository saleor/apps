# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/ChannelAvailability/primitives.tsx` (`ChannelIcon`, `CurrencyBadge`) + list-row anatomy from `ChannelAvailabilityListItem.tsx`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- No `react-intl` — no Error/Draft badges in this package surface.
- Status union kept open (`success | hidden | warning | error | scheduled`) but Stripe only uses `success` / `hidden` from `isActive`.
- Success green `#0ABF53` vendored as `CHANNEL_STATUS_SUCCESS_COLOR` (Dashboard `SUCCESS_ICON_COLOR`).
- Status on hover via native `title` (Active / Inactive) instead of Dashboard’s Macaw `Tooltip` chrome.
