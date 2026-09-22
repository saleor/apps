# Upstream source

- **Original:** `saleor-dashboard/src/productTypes/components/ProductTypeVariantAttributes/ProductTypeVariantAttributes.tsx`
  — the `VariantSelectionSwitch` pill ("Variant selection on" / "off") and its
  `.selectionSwitch` styles.
- Pill geometry, the `role="button"` wrapper and the inert inner `Toggle` are kept as they are there.

## Intent

A state that is worth stating and cheap to change, in one line:

- `role="button"` on a `Box` rather than a real `<button>`, as upstream does, because macaw's `Toggle`
  is itself a button and nesting buttons is invalid markup. The pill owns the click, the keyboard
  handler and `aria-pressed`; the `Toggle` inside is `aria-hidden`, `tabIndex={-1}` and has
  `pointer-events: none`, so there is one control and one tab stop.
- Same pill as this package's `StatusChip`, which it shares a status row with: the row is one line of
  facts about the same document, and the `Toggle` is already what marks this one as the control.
- **Divergence — `tone="warning"`:** warning border while it is off, neutral surface throughout.
  Upstream has one treatment because "variant selection off" is a legitimate configuration; an app
  needs the other case, where off means nothing is being sent and the merchant may not have meant it.
  Border only, matching `Callout`, which also carries status on the edge and never fills: a filled
  warning surface on a pill this small reads as an error to be cleared rather than a state to notice.
  Only the off state is marked, so the on state stays quiet.
- **Divergence — `tooltip`:** upstream shows a tooltip only to explain why the switch is disabled.
  Here it carries what the state means and what flipping it does, through the package's `TooltipBody`
  for the width cap.
