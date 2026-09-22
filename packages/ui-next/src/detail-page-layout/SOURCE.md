# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/Layouts/Detail/` (`detail-content-scroll.ts` from
  `scrollElementIntoDetailContent.ts`, commit `696b6ccf5cbd1c4d25d04aba5b7a3b615a5fec3a`)
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`.
- Height model adapted for iframe-mounted apps: default is flexible (`min-height: 100%`) rather
  than Dashboard’s `100vh - savebarHeight - borders` calc. Pass `withSavebar` to give the layout
  a definite `height: 100%` and bottom padding so Content scrolls above a fixed `Savebar`.
- Does not depend on Dashboard `hide-scrollbar` / `mobile-full-height` global CSS classes; scrollbar hiding is optional via CSS module.
- `detail-content-scroll.ts` treats the scrollport as either the content pane or the document, since
  the height model above means the pane only overflows with `withSavebar`. See
  `../detail-section-nav/SOURCE.md` for the rest of that divergence.
