---
"saleor-app-products-feed": minor
---

Changed format of product URLs to Handlebars. Previous format can still be parsed, so this change does not affect existing configurations.

Old format: `http://example.com/{variantId}`
New format: `http://example.com/{{variant.id}}`
