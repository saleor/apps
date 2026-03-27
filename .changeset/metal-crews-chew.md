---
"saleor-app-smtp": minor
---

App will now parse `additional_data` received from Saleor in /register endpoint and use it to save Sandbox SMTP configuration in DynamoDB. This configuration toggles if SMTP Sandbox server should be used and if all sent email receipient should be overwritten to a single email adderss.
