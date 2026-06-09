---
"saleor-app-anonymizer": minor
---

Added the Anonymizer app to the monorepo. It lets you anonymize a customer's personal data from the Saleor Dashboard: it scrambles the billing and shipping details of all the customer's orders (names blanked, phone replaced with a non-functional number, email replaced with a random address under a configurable domain) and then deletes the customer. The app now uses the shared monorepo tooling (ESLint, TypeScript and dependency catalog) and observability stack (Sentry, OpenTelemetry, structured logging, env validation).
