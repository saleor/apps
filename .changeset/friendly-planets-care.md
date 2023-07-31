---
"saleor-app-search": minor
---

Improved attributes mapping. Now Algolia will receive better products data:
- Added `otherVariants` field which is *an array of variant id strings*. It will only contain other variants, so if the array is empty, it means the variant is the only one. It can be quickly used to count alternative variants or to reference them by ID.
- Added `variantMetadata` field. Now `metadata` contains data for product parent and `variantMetadata` for each variant.
- Improved JSON fields mapping. Now json-like fields will be sent to Algolia as structure jsons, not strings. This include: `description`, `metadata`, `variantMetadata`, `otherVariants`. 

