---
"saleor-app-avatax": patch
---

Fixed Client Logs date filter showing an opaque error when the "From" date was after the "To" date. Before, the request was sent and DynamoDB rejected it with a generic validation error. Now the form skips the request and shows a clear inline message, and the API rejects inverted ranges with a 400 response.
