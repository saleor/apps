---
"@saleor/apps-shared": minor
---

Introduce `isSaleorCompatible` method to `SaleorVersionCompatibilityValidator` that accepts `SaleorSchemaVersion` tuple (e.g., `[3, 22]`) for version validation. This complements the existing `isValid` and `validateOrThrow` methods that work with string versions (e.g., `"3.13.0"`). The new method enables more convenient validation when working with Saleor's schema version format from app metadata.
