# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Savebar/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Fixed footer inside the app iframe instead of `@radix-ui/react-portal` + `SavebarRefProvider`.
  Dashboard portals into an AppLayout anchor outside the page; apps do not have that chrome.
  `position: sticky` is not enough: with a short form it sits under the content instead of at
  the bottom of the iframe view, so the bar is `position: fixed` and `DetailPageLayout`'s
  `withSavebar` reserves matching bottom padding.
- Action button labels are required `children` (no `react-intl` defaults), so `errorLabel`
  defaults to a plain `"Try again"` string instead of a translated message.
- `ConfirmButton` keeps Dashboard's transition-state behavior (`src/components/ConfirmButton/`):
  spinner while `loading`, checkmark held for 3s on `success`, error variant with a retry label,
  pointer events blocked while locked, and `disabled` ignored while completed feedback shows so the
  button color does not flicker. The spinner is `lucide-react`'s `Loader2` rather than Dashboard's
  `SaleorThrobber`, which depends on vendored Saleor logo path geometry.
