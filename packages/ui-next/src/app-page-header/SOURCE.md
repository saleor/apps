# Upstream source

- **Repo:** saleor-dashboard
- **Path:** inspired by `src/components/AppLayout/TopNav/` (not a line-for-line port)
- **Commit:** `1f2391dcec285d5dc067e9ca6ceb574b159f9d73`

## Intentional divergences

- Apps mount inside Dashboard’s iframe and already get Dashboard chrome (extension nav).
  This header is a **title + actions** bar only — no back-to-list destination icons from
  Dashboard `TopNav`.
- Optional `href` / `hrefTitle` for in-app breadcrumbs-style back links when needed. Rendered
  with `AppLink`, which is a real anchor that navigates through `next/router`: a document load
  inside Dashboard’s iframe drops the AppBridge params from the frame URL, and the app then
  renders its “no permission” state instead of the page.
- `titleControl` renders a control where the title sits, keeping `title` as a visually hidden `h1`.
  Dashboard detail pages have no equivalent — they move between sibling records with pagination
  arrows — but a page reached from a list of fifteen siblings has nowhere else to put a switcher,
  and the heading is still what answers “which record is this”.
