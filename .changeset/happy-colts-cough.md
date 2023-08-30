---
"saleor-app-search": patch
---

Refactor: Migrated private metadata of the app (used for settings) - previously each setting was saved in a dedicated metadata key. Now entire config is kept as JSON in a single field. This is non-breaking change - app will fallback to old config if needed.
