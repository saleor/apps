# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Pill/Pill.tsx` + `getStatusHue` in `src/misc.ts` +
  `hueToPillColorLight` / `hueToPillColorDark` in `src/components/Datagrid/customCells/PillCell.tsx`
- **Commit:** `3508127f50dcd9388ad39b656f906150134eb544`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of wrapping legacy macaw `Pill` (`@saleor/macaw-ui`
  0.7.x). Apps must not introduce that package.
- Colors are the Dashboard oklch hues, not `--mu-*` mixes. Payment / fulfillment pills are
  defined as those washes (`oklch(94% 0.065 <hue>)` light, `oklch(40% 0.07 <hue>)` dark);
  macaw semantic tokens do not produce the same mint / sky / peach.
- Typography is the datagrid pill (`12px` / `500` / `1.35` line-height, no uppercase, no
  letter-spacing). Legacy macaw `labelSmall` was `1.2rem` uppercase + `0.1rem` tracking — that
  is not what Dashboard order pills look like.
- Optional tooltip, same keyboard-reachable pattern as `StatusChip`.
- No `attention` / `generic` tones. Those collapse onto `warning` / `neutral`.
