# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Savebar/`
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Sticky footer inside the app iframe instead of `@radix-ui/react-portal` + `SavebarRefProvider`.
  Dashboard portals into an app-layout anchor outside the page; apps do not have that chrome.
- No `ConfirmButton` transition-state component — uses macaw `Button` with optional `disabled` /
  loading left to the caller.
- Action button labels are required `children` (no `react-intl` defaults).
