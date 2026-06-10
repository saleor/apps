<div align="center">
<img width="150" alt="saleor-app-anonymizer" src="https://user-images.githubusercontent.com/4006792/215185065-4ef2eda4-ca71-48cc-b14b-c776e0b491b6.png">
</div>

<div align="center">
  <h1>Saleor Anonymizer App</h1>
</div>

<div align="center">
  <p>Anonymize customer data directly from the Saleor Dashboard.</p>
</div>

---

## Overview

The Anonymizer App helps anonymize a customer's personal data:

- Looks up a user and all of their orders by email.
- Scrambles the order billing and shipping details:
  - First name / last name → blanked out.
  - Phone → replaced with a constant, non-functional number.
  - Email → replaced with a random `UUID`-based address under a configurable domain.
- Deletes the customer profile once all of their orders are anonymized.

The configurable scramble domain is controlled by the
`NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN` environment variable.

### Bulk anonymization

The app can also process the whole store at once:

- A **Scan** walks all orders and customers and shows how many will be processed.
  The results are kept in memory, so the actions below run without re-fetching.
- **Anonymize orders** scrambles every order that does not yet carry the
  `saleor-anonymized: true` public metadata flag, then writes the flag. Orders that
  already carry it are skipped, so re-runs are idempotent and failed orders are
  retried on the next run (the flag is written only after a successful scramble).
- **Delete customers** deletes every non-staff customer account. Staff accounts are
  never counted or deleted.
- Everything runs in the browser with a progress bar; records that failed to process
  are listed as links opening in a new Dashboard tab.

The number of records processed concurrently is controlled by the
`NEXT_PUBLIC_BULK_CONCURRENCY` environment variable (default: 5).

## Required permissions

- `MANAGE_ORDERS`
- `MANAGE_USERS`

## Development

This app lives in the [saleor/apps](https://github.com/saleor/apps) monorepo and follows the
shared tooling (ESLint, TypeScript and dependency catalog) used across all apps.

```bash
# from the repository root
pnpm install

# run only this app
pnpm --filter saleor-app-anonymizer dev

# generate GraphQL types
pnpm --filter saleor-app-anonymizer generate

# type-check / lint / test
pnpm --filter saleor-app-anonymizer check-types
pnpm --filter saleor-app-anonymizer lint
pnpm --filter saleor-app-anonymizer test
```

Copy `.env.example` to `.env` and fill in the required values before starting the app.

## Auth data storage (APL)

This app has no backend that needs to call Saleor outside of the request that carries its own auth,
so it does not persist auth data. It uses a `NoopAPL` (`src/lib/noop-apl.ts`) that stores nothing,
and therefore requires no APL-related environment variables.
Read more in the [APL documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl).
