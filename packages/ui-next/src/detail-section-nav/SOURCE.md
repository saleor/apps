# Upstream source

- **Repo:** saleor-dashboard
- **Path:** `src/components/DetailSectionNav/DetailSectionNav.tsx` + `DetailSectionNav.module.css`,
  `resolveActiveSectionIndex.ts`, `useDetailSectionScrollSpy.ts`; scrolling helpers from
  `src/components/Layouts/Detail/scrollElementIntoDetailContent.ts` (vendored as
  `../detail-page-layout/detail-content-scroll.ts`)
- **Commit:** `696b6ccf5cbd1c4d25d04aba5b7a3b615a5fec3a`

## Intentional divergences

- Imports from `@saleor/macaw-ui` instead of `@saleor/macaw-ui-next`; `--mu-font-size-3` in place of
  upstream's `--mu-fontSizes-3` token spelling.
- `ariaLabel` is optional and defaults to `"Sections"`. Upstream requires it because every string
  goes through `react-intl`; callers here own their copy (see the i18n contract in ADR 0004).
- No `DetailSection` wrapper. Upstream wraps each card to give it an id and a `scroll-margin-top`;
  `SettingsSection` already takes an `id`, and the scroll margin lives in its own stylesheet.
- The scroll root is resolved rather than assumed. Upstream can trust
  `[data-detail-content-scroll]`, because Dashboard detail content is always the scrollport. An app
  is an iframe where that pane only overflows when the page reserves a `Savebar`, so the helper
  falls back to the document and `readDetailContentScrollport` normalizes the geometry of both —
  otherwise a non-scrolling pane reports `scrollHeight === clientHeight`, which reads as
  "scrolled to the bottom" and pins the last section as active forever.
- Dropped `align: "end"` scrolling and its `ResizeObserver` pinning. That exists for the Dashboard's
  SEO accordion, which grows after the scroll starts; nothing here does.
- Rows may carry `icon` and `end`. The icon is `aria-hidden`; `end` is a trailing control that is
  not part of the select button (Dashboard has no equivalent). Used for actions that belong to the
  current section, such as Reset.
- `nested` renders after the rail so a submenu (filters of the active section) does not inherit
  the current-section mark.
- Dropped `resetScrollOutsideContentRoot`. It protects the Dashboard's `TopNav` from being scrolled
  out of view, and an app iframe has no nav of its own inside it.
- The scroll-spy effect keys on the joined section ids rather than the array identity, since callers
  build the list inline on each render.
