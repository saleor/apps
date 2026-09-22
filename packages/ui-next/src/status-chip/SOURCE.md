# Upstream source

- **Original:** designed for Saleor Apps. Closest Dashboard relatives are its inline pills
  (`SettingsOwnershipChip` here, product status badges there) and the variant selection pill this
  package's `ToggleChip` comes from.
- Not a direct Dashboard port: the Dashboard has no chip that carries its own explanation.

## Intent

State a steady fact about the thing on screen in a line, with the reasoning one hover away:

- `Callout` is for something wrong or something to do. A page that reports every unchanging fact as
  a callout — "this is the built-in copy", "this one skips the shared layout" — buries the callouts
  that need acting on, and a stack of them pushes the work itself below the fold.
- Same pill geometry as `ToggleChip`, which it shares a status row with. An earlier version was
  square-cornered so shape would separate the statement from the control; side by side that reads as
  two unrelated components rather than one row about the same document, and the toggle is already the
  thing that says which one acts.
- No glyph. The label is the content, and an `Info` icon on every chip in a row adds a column of
  identical marks that says nothing about which chip is worth hovering. `cursor: help` and the
  hover border carry the affordance instead.
- The tooltip trigger is a `button`, not the chip's own element, so the explanation is reachable by
  keyboard rather than hover only.
- Tooltip content goes through the package's `TooltipBody`, which caps the width and re-wraps —
  macaw's tooltip does neither, and an explanation is longer than a label.
