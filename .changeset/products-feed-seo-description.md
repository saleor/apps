---
"saleor-app-products-feed": patch
---

The Google Merchant Center feed now uses a product's SEO description for the `g:description` attribute when one is set. Before, the feed always used the regular product description; now it prefers the SEO description and only falls back to the regular description when the SEO description is empty. This lets merchants control the description sent to Google Merchant Center via the product's SEO settings.
