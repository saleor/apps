---
"saleor-app-search": patch
---

Fixed NUMERIC product/variant attributes (e.g. `width`, etc) being indexed in Algolia as strings, which prevented using `numericFilters` against them. They are now indexed as numbers.

Added `productTypeName` to every indexed product record alongside the existing `productTypeId`, so storefronts can filter by product type name in Algolia without an extra round trip to the Saleor API.

**After upgrading, run a full re-import via the in-app "Import products to Algolia" button — existing records will retain their old (string) attribute values and missing `productTypeName` until re-indexed.**
