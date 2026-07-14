---
"saleor-app-products-feed": patch
---

Added a "Use SKU as GTIN" toggle to the Google feed attribute mapping. When enabled, variants without a mapped GTIN attribute use their SKU as the GTIN, so you no longer need to duplicate SKUs into a custom attribute. Products that have a mapped GTIN attribute keep that value.
