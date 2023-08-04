---
"saleor-app-products-feed": minor
---

Updated pricing attributes according to the Google guidelines.

Was:
- Price: base or discounted price

Now: 

- Price: always the base price. Attribute skipped if amount is equal to 0.
- Sale price: discounted price. Attribute skipped if value is the same as base price
