# Upstream source

- **Original:** designed for Saleor Apps, on macaw's `Tooltip`.
- The Dashboard uses the same idea inline (an info glyph beside a label, e.g. on channel and tax
  fields), but has no extracted component for it.

## Intent

Carry a caveat about the label it follows, for the sentence worth having somewhere but not worth a
line on the page:

- The trigger is a `button` rather than the glyph itself, so the explanation is reachable by keyboard
  rather than hover only, and `aria-label` names what it explains.
- `cursor: help`, not `pointer`: it explains, it does not navigate.
- Content goes through the package's `TooltipBody`, which caps the width and re-wraps — macaw's
  tooltip does neither.

A tooltip is easy to miss by design. Anything a merchant must read to get a setting right belongs on
the page, in a `Callout` or a description.
