---
"saleor-app-search": minor
---

Added new "pricing" field to Algolia object representation. It now contains "onSale", "discount gross amount", "undiscounted gross amount", "gross amount" and "channel listing amount". The "grossPrice" field is deprecated now, its value is the same as "channel listing amount".
