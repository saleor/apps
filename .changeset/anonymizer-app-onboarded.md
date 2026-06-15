---
"saleor-app-anonymizer": minor
---

Added the Anonymizer app to the monorepo. It lets you anonymize a customer's personal data directly from the Saleor Dashboard.

- **Single customer:** look up a customer by email and scramble the billing and shipping details on all of their orders (names and phone cleared; street address line 2, company and district cleared; street address line 1 replaced with a placeholder; email replaced with a random address under a configurable domain; city/postal code/country area/country kept), then delete the customer account. Customers with more than one page of orders are fully covered, and accounts with no orders can still be erased.
- **Bulk:** scan the whole store and anonymize every not-yet-processed order or delete all non-staff customer accounts in one run, with a progress bar. Anonymized orders are flagged so re-runs skip them and retry only failures.

Destructive actions ask for confirmation first, and the app surfaces a warning that erasure covers only the standard orders, customers and addresses APIs. The app uses the shared monorepo tooling (ESLint, TypeScript and dependency catalog) and observability stack (Sentry, OpenTelemetry, structured logging, env validation).
