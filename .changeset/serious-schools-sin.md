---
"saleor-app-taxes": patch
---

Refactored error handling. The app now distinguishes between different types of errors:

- `TaxIncompleteWebhookPayloadError` - thrown when data in the webhook payload is not complete enough to continue with the process.
- `TaxBadPayloadError` - thrown when the webhook payload is not what the app expects.
- `TaxBadProviderResponseError` - thrown when the response from the tax provider is not what the app expects.
- `TaxExternalError` - thrown when the tax provider returns an error.
