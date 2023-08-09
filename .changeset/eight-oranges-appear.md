---
"saleor-app-search": minor
---

Extended search model with two new fields:
- `inStock`: returns true if stock is available. To keep this up to date, the application subscribes to `ProductVariantOutOfStock` and `ProductVariantBackInStock` events
- `media`: array of objects containing URL and type of given file (video or image)
