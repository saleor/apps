---
"saleor-app-onboarding": patch
---

The setup checklist now asks the Dashboard to open the Stripe and SMTP apps by their manifest
identifier, instead of guessing an extensions URL from an app's internal id. On Dashboards that
don't support this yet, those buttons fall back to the installed apps list rather than doing
nothing.
