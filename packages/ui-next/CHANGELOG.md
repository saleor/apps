# @saleor/apps-ui-next

## 0.2.1

### Patch Changes

- c12c623: Counts can use the same compact pill the Dashboard puts on its Filters button, including a longer-than-counted list (`99+`).
- c12c623: Add Pill, StatusDot and StatusLabel, and let settings cards drop their title or sit as a secondary well. Section nav can carry an icon, a trailing control, and a nested submenu.

## 0.2.0

### Minor Changes

- 831f396: Added the components apps need to build a Dashboard-style detail page: `ActionDialog`, `AppLink`, `Callout`, `ConfirmButton`, `DashboardModal`, `DetailSectionNav`, `DetailSettingToggleRow`, `InfoTooltip`, `ListSubheader`, `Skeleton`, `StatusChip`, `SaleorThrobber`, `ToggleChip`, and helpers for scrolling within `DetailPageLayout`.

  `Savebar` now composes the shared `ConfirmButton` instead of its own copy, and gained `Savebar.Changes` — a hint naming which areas of the form are unsaved, so the save bar rather than a locked control is what tells the merchant what Save will persist. Its in-progress spinner is now `SaleorThrobber`, matching Dashboard.

  `AppPageHeader` takes an optional `titleControl` for pages whose subject the user can switch from the header, and its back link now goes through `AppLink`.

  Existing exports keep their current API.

## 0.1.0

### Minor Changes

- d78dcb0: Added `@saleor/apps-ui-next`: shared building blocks for app pages that follow Saleor Dashboard
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
