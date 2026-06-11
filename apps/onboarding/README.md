# Saleor Onboarding App

Saleor App that provides a "Welcome / Onboarding" widget on the Dashboard home page. It guides
users through first-run tasks (creating a product, exploring orders, opening the GraphQL
playground, browsing extensions, inviting staff).

The app is a port of the Dashboard's built-in `WelcomePageOnboarding` widget into a standalone
Saleor App so onboarding can ship independently of Dashboard releases.

## Tech overview

- **Next.js App Router** for both API endpoints (`/api/manifest`, `/api/register`) and UI (`/`).
- **Manifest extension**: `HOME_WIDGETS` mount, `WIDGET` target, `GET` method (the staff JWT
  comes from AppBridge automatically).
- **Client-only**: all GraphQL calls run in the browser using the user's JWT issued by AppBridge.
  No webhooks, no APL persistence (a no-op APL satisfies the SDK's register handler).
- **State persistence**: completion state is stored under user metadata key `onboarding`
  (drop-in compatible with the Dashboard widget's existing key) via `updateMetadata`.

## Local development

```bash
pnpm install
cp .env.example .env
pnpm --filter saleor-app-onboarding dev
```

See [the Saleor docs](https://docs.saleor.io/developer/extending/apps/local-app-development) for
running an app against a local Saleor instance.
