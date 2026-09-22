# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/products/components/ProductVariantPrice/ProductVariantPrice.tsx` +
  `ProductVariantPrice.module.css` (`.headerRow`)
- **Commit:** `696b6ccf5cbd1c4d25d04aba5b7a3b615a5fec3a`

## Intentional divergences

- Extracted as a standalone component. Upstream it is the column-header row of one specific table,
  inlined in that table's markup; here it labels arbitrary row groups inside a card.
- No grid template. Upstream shares `grid-template-columns` with the rows beneath it so the labels
  sit over their columns; a group label has one column, with optional trailing text.
- Optional `note` on an `InfoTooltip` after the label, for a caveat that applies to the whole group.
  A column header has no such thing; a group of settings sometimes does, and the alternative is a
  callout at the other end of the card from the rows it is about. On the glyph rather than a second
  line in the band, since a band that grows a sentence pushes every row of the group down and stops
  reading as a label.
- Optional leading icon, muted to the label's color. Upstream's column headers are text only —
  a table header names a column, whereas a group band names a subject, which the Dashboard's own
  navigation gives a glyph (`TopNavDestinationIcon`).
- Horizontal padding is `spacing-6` to match settings-card rows, rather than upstream's
  `spacing-4`/`spacing-2` asymmetry, which exists to line up with its input cells.
- Draws a top border when it is not the first child, so groups separate themselves. Upstream's
  header row is always first and only needs a bottom border.
