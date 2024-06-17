---
"emails-and-messages": patch
"data-importer": patch
"products-feed": patch
"invoices": patch
"klaviyo": patch
"segment": patch
"app-avatax": patch
"cms-v2": patch
"search": patch
"app-taxjar": patch
"slack": patch
"smtp": patch
"crm": patch
---

Remove custom Next.js + Sentry error. It was causing non existing paths to be reported as 500 instead of 404. We catch Sentry errors in implicit anyway in api routes.
