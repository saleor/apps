---
"saleor-app-taxes": minor
---

Adds new way of distributing discounts on items (proportional). Adds distinguishment between when TaxJar nexus was found and was not. Now, the "not found" behavior is not treated as error, and will return untaxed values. Fixes bugs: item quantity in TaxJar; when shipping = 0; pricesEnteredWithTax influences shipping price.
