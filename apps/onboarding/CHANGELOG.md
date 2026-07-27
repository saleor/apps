# saleor-app-onboarding

## 0.0.4

### Patch Changes

- 546b559: Updated Macaw UI to v2. Icons that used to come from Macaw UI (close, trash, edit, chevrons, arrows, copy, external link, and others) now come from Lucide, so a few icons look slightly different but keep the same meaning and placement.

## 0.0.3

### Patch Changes

- 1baff6d: Updated the app description shown in the Saleor Dashboard to clarify that the Onboarding app mounts itself on the Dashboard home page and does not provide a dedicated UI in the extensions view.

## 0.0.2

### Patch Changes

- 64ddff9: Introduce the Onboarding app — a standalone Saleor App that mounts on the Dashboard home page
  (`HOMEPAGE_WIDGETS` extension) and walks new users through first-run tasks: creating a product,
  exploring orders, opening the GraphQL playground, browsing extensions, and inviting staff.
  Completion state persists in user metadata so progress is preserved across sessions.
