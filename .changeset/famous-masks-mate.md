---
"emails-and-messages": minor
"data-importer": minor
"products-feed": minor
"@saleor/apps-shared": minor
"invoices": minor
"klaviyo": minor
"segment": minor
"app-avatax": minor
"cms-v2": minor
"search": minor
"app-taxjar": minor
"slack": minor
"taxes": minor
"crm": minor
---

Currently, Dashboard requires from a user to have "MANAGE_APPS" to have access to the apps tab. 
Since the release 3.20 Dashboard will allow all users to access to apps tabs without checking permission.
This means that apps will be checking if the user has "MANAGE_APPS" internally and show message "You do not have permission to access this page" if the user does not have the permission.