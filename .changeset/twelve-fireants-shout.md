---
"saleor-app-payment-np-atobarai": patch
---

Renamed `MalformedRequestResponse` to `InvalidEventDataResponse` to better reflect its purpose. This response is used for validation errors in event data, not malformed payloads.
