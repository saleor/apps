---
"@saleor/apps-otel": major
---

**BREAKING CHANGE**. Change package structure. After this change `@saleor/apps-otel` won't export `withOtel` wrapper but rather helpers or factories that should be used by apps to properly setup OTEL. See apps implementation on how to use new version.
