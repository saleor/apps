---
"saleor-app-search": minor
---

Added a new `pricing` field to the Algolia object representation. It now passes variant pricing representation from GraphQL:
- onSale (boolean)
- discount value (net, gross)
- undiscounted price (net, gross)
- final price (net, gross)