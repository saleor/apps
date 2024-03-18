---
"emails-and-messages": major
"data-importer": major
"products-feed": major
"@saleor/apps-shared": major
"invoices": major
"klaviyo": major
"segment": major
"app-avatax": major
"cms-v2": major
"search": major
"app-taxjar": major
"slack": major
"taxes": major
"crm": major
---

Prepare each app to handle user without "MANAGE_APPS" permission by checking permission on each tRPC endpoints, wrapped each handler into createProtectedHandler, and show a message to user without permission.