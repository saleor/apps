# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/ChannelsAvailabilityDropdown/ProductAvailabilityStatusLabel.tsx`
- **Commit:** `3508127f50dcd9388ad39b656f906150134eb544`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- No `react-intl` — callers own the label.
- Aligns the dot to the center of the label (`align-items: center`) rather than baseline-in-a-1em
  box. Dashboard's baseline trick is for wrapping table cells; a one-line status next to a title
  should sit on the cap-height, the way Vercel’s deploy badge does.
- Optional tooltip, same keyboard-reachable pattern as `StatusChip`. Dashboard's label has no
  explanation of its own.
- Optional `live` pulse, forwarded to `StatusDot`.
- Uses this package's `StatusDot` (which adds an `info` tone Dashboard's dot does not have).
