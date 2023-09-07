---
"saleor-app-search": minor
---

Added new "pricing" field to Algolia object representation. It now passes variant pricing representation from graphQL:
- onSale (boolean)
- discount value (net, gross)
- undiscounted price (net, gross)
- final price (net, gross)