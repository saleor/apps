---
"saleor-app-taxes": minor
---

Changed behavior of failed webhooks. The app will now return status 500 if the operation failed. Previously, it returned status 200 with an error message in the response body.
