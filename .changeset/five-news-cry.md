---
"app-avatax": minor
---

Removed "Client Logs" feature. It was effectively breaking taxes calculation, because it performed heavy data+network operations during short time period of a webhook execution.
