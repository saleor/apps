---
name: reporting-app-problems
description: >
  Use when an app hits a condition the merchant or staff must act on or know about
  (wrong or missing configuration, rejected credentials, third-party permission
  errors, failed webhook setup, suspicious results), when writing a warn/error log
  for such a condition, when adding config save or validation that resolves one,
  or when adding `@saleor/app-problems` to an app.
---

# Reporting app problems

App problems surface in the Saleor Dashboard on the app's detail page. A log line
reaches only us; an app problem reaches the merchant, who can fix it. API reference:
https://docs.saleor.io/developer/extending/apps/developing-apps/apps-patterns/reporting-problems

## When to report

Report whenever the fix lives on the merchant's side: a bad config, revoked
credentials, a missing permission in the third-party account, a setting that
makes events get dropped. If you write `logger.warn` or `logger.error` for such
a condition, report a problem next to it. Keep the log too: logs are for us,
problems are for the merchant.

Leave out conditions only we can fix (bugs, our own outages) and per-request noise
that the merchant can't act on.

Every report needs a matching **clear**: dismiss the key on the path that proves
the problem is gone, such as a successful config save, a successful connection
test, or a successful call to the third-party API. A problem nobody clears stays
on the Dashboard after it is fixed.

Done when every merchant-fixable failure path in the change reports a problem, and
each key has a clear path.

## Shape

Each app wraps `AppProblemsReporter` from `@saleor/app-problems` in one module,
`src/modules/app-problems/`. Copy the shape from `apps/segment/src/modules/app-problems/`
(global keys) or `apps/avatax/src/modules/app-problems/` (keys scoped per config):

- `<app>-problem-reporter.ts`: `PROBLEM_KEYS`, one `reportX()` method per problem,
  and the `clearX()` methods. Each method returns `Promise<void>` and never throws.
- `create-<app>-problem-reporter.ts`: builds the reporter from `AuthData` for webhooks.
  In tRPC routers, pass `ctx.apiClient` to the constructor instead.
- A test that asserts key, threshold and message, and asserts that a failed
  `reportProblem` does not throw.

New app: add `"@saleor/app-problems": "workspace:*"` to its `package.json`. No
extra permission is needed: any app token can report its own problems.

## Inputs

- **`key`**: names the problem type, never one occurrence. Prefix it with the app
  name and suffix it with the scope it applies to (`avatax-invalid-credentials:${configId}`)
  so clearing one config leaves the others. 3–128 characters.
- **`message`**: a sentence for a merchant: what is wrong, what breaks because of it,
  and what to do. Name the config or channel they recognise. Leave secrets and
  customer data out. 3–2048 characters.
- **`criticalThreshold`**: `1` when something is broken now (bad credentials,
  missing config). Higher (for example `5`) for intermittent failures that matter
  only when repeated. Omit it for informational problems.
- **`aggregationPeriod`**: the default 60-minute sliding window merges reports with
  the same key and counts them. Use `0` only when each event must be its own record.

## Non-blocking

Reporting is a side effect. It never delays the response and never changes it.
Run it after the response is sent:

- **App Router** (anything under `src/app/`, including tRPC served there): `after()` from
  `next/server`. Use the app's wrapper if it has one (avatax: `afterDetached`
  in `src/lib/otel/after-detached.ts`).
- **Pages Router** API routes: `after()` doesn't work there. Use `waitUntil` from
  `@vercel/functions` (in the pnpm catalog): `waitUntil(reporter.reportConfigMissing())`.
  A bare `void promise` can be dropped when the serverless function freezes after
  the response.

## Failure handling

`appProblemCreate` and `appProblemDismiss` exist from Saleor 3.22.36. Older Saleor
returns a GraphQL error, so every call can fail on older versions. The reporter returns a
`Result`. On `isErr()`, log with `logger.warn` and continue. `logger.error` here
fills the logs with one entry per webhook on every older Saleor.
`AppProblemsReporter.isApiCompatible(version)` can skip the call when the Saleor
version is already known.
