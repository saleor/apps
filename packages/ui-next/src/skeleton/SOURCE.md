# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Skeleton/Skeleton.tsx` + `skeleton.css`
- **Commit:** `696b6ccf5cbd1c4d25d04aba5b7a3b615a5fec3a`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- File names are kebab-case to match the rest of this package.
- Class is `apps-ui-skeleton` and the keyframes are `appsUiSkeletonBreathe`, so the rules do not
  collide with Dashboard's `.dashboard-skeleton` if both stylesheets ever share a document.
- `clsx` for the class merge instead of the inline `filter(Boolean).join(" ")`.
- The fill also ships in `@saleor/apps-ui-next/style`, so macaw's own `Skeleton` in an app that
  already imports the kit stylesheet picks up the same colors without a component swap.
- The border is mixed into `transparent` instead of `background-default1`, so bars stay visible on
  tinted surfaces. On `background-default1` the result is the same color.
