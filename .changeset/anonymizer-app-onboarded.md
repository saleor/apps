---
"saleor-app-anonymizer": minor
---

Added the Anonymizer app to the monorepo. It lets you anonymize a customer's personal data from the Saleor Dashboard: it scrambles the billing and shipping details of all the customer's orders (names and phone cleared, street replaced with a placeholder, email replaced with a random address under a configurable domain, while city/postal code/country are kept) and then deletes the customer. The app now uses the shared monorepo tooling (ESLint, TypeScript and dependency catalog) and observability stack (Sentry, OpenTelemetry, structured logging, env validation).
