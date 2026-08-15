# Upstream source

- **Repo:** none — apps-only, no Dashboard counterpart.

Dashboard owns the document it renders in, so it has no equivalent reset. Apps are mounted in
a Dashboard iframe and need one: the browser default `body { margin: 8px }` insets the whole
frame, and the Next Pages Router `#__next` wrapper breaks the `height: 100%` chain that
`DetailPageLayout` and a fixed `Savebar` depend on.

Exported as `@saleor/apps-ui-next/style`, mirroring `@saleor/macaw-ui/style`.
