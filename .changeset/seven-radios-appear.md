---
"app-avatax": minor
---


Experimental: Added client logs feature. `FF_ENABLE_EXPERIMENTAL_LOGS` variable must be set to `"true"`

When enabled, app will required configured DynamoDB table. See readme for details.

Client logs store business transactions in the persistent storage. Operations like taxes calculation or corresponding failures will be written.

Logs can be accessed via App's configuration page in Saleor Dashboard.