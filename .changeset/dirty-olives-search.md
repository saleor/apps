---
"saleor-app-invoices": minor
---

App no longer shows initial loading spinner. It renders nothing until initial required data (channels) are fetched. When this happens, AppBridge informs Dashboard (via NotifyReady action) that it can be displayed.
