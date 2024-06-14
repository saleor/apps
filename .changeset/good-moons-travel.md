---
"emails-and-messages": patch
"@saleor/sentry-utils": patch
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

Reverted shared Sentry configuration (init() part). It was not working properly - source maps were not properly assigned. Now configuration is not shared, but repeated in every app separately
