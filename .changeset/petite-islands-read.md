---
"saleor-app-search": minor
---

Added category indexing to Algolia. Categories are now synced via `CATEGORY_CREATED`, `CATEGORY_UPDATED`, and `CATEGORY_DELETED` webhooks, and included in the bulk import flow.

Each category object in Algolia contains: `name`, `slug`, `level`, `ancestors` (flat array of `{id, name, slug}`), `metadata`, and `_type: "category"`. Categories are stored in a dedicated `<prefix>.categories` index with faceting on `level`, `ancestors`, and `metadata`.

Also enriched product objects with `productTypeId`, `categoryId`, and `categorySlug` fields, and added corresponding faceting/search attributes to product indices.
