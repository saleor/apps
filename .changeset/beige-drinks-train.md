---
"saleor-app-products-feed": patch
---

Changed error handling. Now if internal operations in feed generation logic fails (throws error), feed generation will be interrupted and error returned. This should allow Google Merchant Center to retry operation, instead of consuming malformed XML.
