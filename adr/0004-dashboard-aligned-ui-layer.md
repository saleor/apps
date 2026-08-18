# 4. Dashboard-aligned UI layer for Saleor Apps

Date: 2026-08-15

## Status

Accepted

## Context

Saleor Dashboard has introduced a new configuration design language: entity-detail layouts (`DetailPageLayout`, `DetailSettingsCard`), guided setup checklists (`SetupChecklist`), and related patterns. Apps in this monorepo will be mounted into Dashboard configuration views and must look consistent with that chrome.

Those Dashboard primitives live under `src/components/` and resolve through the private `@dashboard/*` path alias. They are not published as an npm package. External apps cannot import them.

Meanwhile, `@saleor/apps-ui` wraps an older layout idiom (`Layout.AppSection`, `ConfigsList`, `EmptyConfigs`). Ten apps depend on it. Rewriting it in place would force a simultaneous migration of every consumer.

A parallel problem already exists: `apps/onboarding` forked Dashboard's setup-checklist CSS into a 661-line module. Copying that fork again for Stripe (or any other app) would multiply drift with no sync path.

Dashboard and this monorepo both use modern Macaw UI (Dashboard via the `@saleor/macaw-ui-next` alias for `@saleor/macaw-ui@1.4.x`; apps via `@saleor/macaw-ui@2.0.0` in the workspace catalog). Token and component surfaces are compatible today. Legacy Macaw 0.7.x must not be introduced here.

This monorepo has no `react-intl`. Dashboard components that use `FormattedMessage` for internal defaults cannot be copied verbatim.

## Decision

### New package: `@saleor/apps-ui-next`

We introduce `packages/ui-next`, published as `@saleor/apps-ui-next`, as the home for Dashboard-aligned UI primitives.

- Follow the existing raw-TypeScript convention (`"main": "index.ts"` / `"exports"`, no build step, typecheck via `tsc` with `noEmit`).
- Peer-depend on modern `@saleor/macaw-ui` (catalog), `react`, `react-dom`, `lucide-react`, and `clsx`.
- Leave `@saleor/apps-ui` untouched. Apps migrate one at a time. Deprecate `@saleor/apps-ui` once it has no consumers.

### Vendoring, not publishing from Dashboard

Until Dashboard publishes these components (or they graduate into Macaw UI), we **vendor** selected primitives into `@saleor/apps-ui-next`.

Each vendored component directory carries a `SOURCE.md` that records:

1. The upstream path in `saleor-dashboard` (e.g. `src/components/SetupChecklist/`)
2. The `saleor-dashboard` commit SHA the port was taken from
3. Intentional divergences (i18n stripping, iframe shell adaptations, etc.)

A future sync is then a three-way diff against that SHA, not archaeology.

### Macaw policy

- Import from `@saleor/macaw-ui` only. Never add legacy `@saleor/macaw-ui@0.7.x`.
- Keep the apps catalog Macaw version within a token-compatible range of whatever Dashboard ships. Before bumping Macaw on either side, diff `--mu-*` custom properties from both `dist/style.css` files. Vendored CSS modules depend on that stability.
- Follow the `saleor-app-ui` agent skill (adapted from Dashboard's styling skills) for Box vs CSS modules, tokens, elevation, and anti-patterns.

### i18n contract

Ported components accept `ReactNode` for all merchant-facing copy. They must not depend on `react-intl` or hardcode English strings for labels that Dashboard localizes via `FormattedMessage`. Callers own localization.

### Graduation to Macaw UI

A component may be proposed for upstream Macaw UI when:

1. At least two apps in this monorepo consume it in production, and
2. The public API has been stable across those usages (no app-specific props), and
3. The component has no Saleor-domain coupling (no AppBridge, no GraphQL, no Dashboard routing).

App-specific wrappers (e.g. `StripeSetupCard`) stay in the app. Layout and checklist primitives are candidates; domain checklists are not.

### Deprecation of `@saleor/apps-ui`

1. New shared UI lands only in `@saleor/apps-ui-next`.
2. Apps migrate as they adopt the new layout (Stripe first, then others).
3. When `@saleor/apps-ui` has zero consumers, mark it deprecated in its `package.json` and remove it in a follow-up.

## Consequences

- Principals can review the package API and vendoring policy before application PRs land.
- Onboarding can delete its forked checklist CSS once it consumes the shared `SetupChecklist`.
- Stripe (and later apps) get Dashboard-consistent configuration UI without waiting on a Macaw release.
- We accept ongoing sync cost with Dashboard until graduation or a published shared package exists; `SOURCE.md` makes that cost explicit and manageable.
- Reviewers must reject PRs that introduce legacy Macaw or hardcode colors outside `--mu-*` tokens.
