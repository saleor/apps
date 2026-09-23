# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/StatusDot/StatusDot.tsx` + `getDotColor` in `src/misc.ts`
- **Commit:** `3508127f50dcd9388ad39b656f906150134eb544`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Tone union is `success | info | warning | error | neutral`. Dashboard's `DotStatus` has
  `scheduled` instead of `info`; apps need `info` for in-flight work (Building, Updating).
  `scheduled` is not used by any app yet.
- Success is a saturated green (`oklch(0.64 0.19 146)` light / `oklch(0.78 0.19 146)` dark),
  not the `Pill` wash. Other tones use `--mu-*`.
- Optional `live` pulse for in-flight states. Dashboard's dot does not pulse; Vercel-style
  deployment status does. Honors `prefers-reduced-motion`.
