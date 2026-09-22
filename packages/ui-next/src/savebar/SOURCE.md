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
- The bar is `savebarHeight - 1px` tall, where Dashboard's anchor is the full height plus a border it
  pulls back over the content (`margin-top: -1px`). Fixed to the bottom of an inset frame there is
  nothing to pull back, so the height has to absorb the border instead — otherwise the line sits a
  pixel above the sidebar hairline it is meant to continue.
- Action button labels are required `children` (no `react-intl` defaults), so `errorLabel`
  defaults to a plain `"Try again"` string instead of a translated message.
- `Savebar.Changes` is Dashboard `SavebarCompositionHint` without `react-intl`: "Unsaved
  changes: {segments}". Render it immediately before Cancel/Save (after the spacer), not
  among leading actions. Hidden under 720px so those buttons stay usable.
- `ConfirmButton` is the shared primitive in `confirm-button/` (Dashboard
  `src/components/ConfirmButton/`). The save-bar wrapper only adds `size="large"`, `type="submit"`,
  and `data-test-id="button-bar-confirm"`. In-progress uses `SaleorThrobber`, same as Dashboard.
