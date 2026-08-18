---
"@saleor/apps-ui-next": minor
---

Added `@saleor/apps-ui-next`: shared building blocks for app pages that follow Saleor Dashboard
layout and styling — page header, detail page layout, settings page content and sections,
save bar, foldable group box, channel rows, setup checklist (with a parked variant) and icon
sizing helpers. Each component documents its upstream Dashboard source in a `SOURCE.md`.

The save bar's confirm button reports progress the way Dashboard does: a spinner while saving and
a checkmark when it succeeds, instead of a relabelled button. `ExitFormDialog` asks before leaving
a form with unsaved changes, which apps need because the Dashboard iframe suppresses the browser's
own "leave site?" prompt.

Also ships `@saleor/apps-ui-next/style`, a document reset that makes app pages full bleed inside
the Dashboard iframe, so page content lines up with Dashboard content instead of sitting inside
the browser's default body margin.
