---
"emails-and-messages": minor
"data-importer": minor
"products-feed": minor
"@saleor/apps-shared": minor
"invoices": minor
"@saleor/trpc": minor
"segment": minor
"app-avatax": minor
"cms-v2": minor
"search": minor
"app-taxjar": minor
"slack": minor
"smtp": minor
"crm": minor
---

Remove Pino logger library. It was already deprecated but for non migrated apps it was causing build errors. Right now we have one logger - @saleor/app-logger pkg.
