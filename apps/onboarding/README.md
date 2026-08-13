# Saleor Onboarding App

Saleor App that mounts a **Store Readiness** guide on the Dashboard home page
(`HOMEPAGE_WIDGETS`). It walks new merchants through first-run commerce setup:

1. Set up your sales channel (warehouse + shipping)
2. Add your first product
3. Connect payments
4. Place a test order (optional)

Secondary tracks (not in required progress):

- **Before you go live** — SMTP customer email + template review
- **Connect Paper storefront** — deploy/configure Paper (wide screens: sibling card on the right with Paper logo)

Builder tools (GraphiQL shortcut, custom app / API token, invite staff) live under
“Building with the API?” — not in the primary checklist.

Completion for commerce steps is **derived from live GraphQL** (channel stock /
shipping, products, payment apps, orders). UI preferences (builder open) persist
in user metadata under the `onboarding` key. Expanded checklist rows stay
in local React state only (not metadata — avoids loading flicker on save).

## Tech overview

- **Next.js App Router** for API endpoints (`/api/manifest`) and **Pages Router** for the UI
  (`src/pages/index.tsx`, served at `/`).
- **Manifest extension**: `HOMEPAGE_WIDGETS` mount, `WIDGET` target, `GET` method (the staff JWT
  comes from AppBridge automatically).
- **Client-only**: all GraphQL calls run in the browser using the user's JWT issued by AppBridge.
  No webhooks and no APL — the app only exposes the manifest endpoint.
- **Home panel layout**: fills the Dashboard home panel (no WidgetResize — that fought
  layout sizing and contributed to loading flicker).

## Local development

```bash
pnpm install
cp .env.example .env
pnpm --filter saleor-app-onboarding dev
```

See [the Saleor docs](https://docs.saleor.io/developer/extending/apps/local-app-development) for
running an app against a local Saleor instance.
