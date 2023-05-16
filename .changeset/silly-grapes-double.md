---
"saleor-app-taxes": patch
---

Fix the calculations of shipping price and line prices based on the `pricesEnteredWithTax` value. Before, the Tax App didn't consider the `pricesEnteredWithTax` setting. Now, it will return different values for `pricesEnteredWithTax` true/false.
