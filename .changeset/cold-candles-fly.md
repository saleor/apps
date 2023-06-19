---
"saleor-app-taxes": patch
---

The update provider configuration views no longer return "invalid credentials" and "invalid address" errors in inappropriate cases. The latter required temporarily disabling the TaxJar address validation, as it currently doesn't work.
