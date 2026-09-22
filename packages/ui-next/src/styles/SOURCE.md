# Upstream source

- **Repo:** none — apps-only, no Dashboard counterpart.

Dashboard owns the document it renders in, so it has no equivalent reset. Apps are mounted in
a Dashboard iframe and need one: the browser default `body { margin: 8px }` insets the whole
frame, and the wrappers between `body` and the page — Next's `#__next` and Macaw's
`ThemeProvider`, which renders `<main id="macaw-ui-root">` — both default to auto height, breaking
the `height: 100%` chain that `DetailPageLayout`, sticky rails and a fixed `Savebar` depend on.

The `text-wrap-style` defaults are ours too. Dashboard sets no line-breaking style at all, so
adopting these is a divergence rather than a port; it is here rather than in each component
because `pretty` only reaches description copy by inheriting from the document.

The skeleton fill is the exception: it is Dashboard's (`src/components/Skeleton/skeleton.css`),
imported here so macaw's own `Skeleton` matches voucher and channel detail loading without every
call site switching components. See `src/skeleton/SOURCE.md`.

Exported as `@saleor/apps-ui-next/style`, mirroring `@saleor/macaw-ui/style`.
