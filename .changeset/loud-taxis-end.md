---
"saleor-app-invoices": patch
---

Changed how Saleor version is validated during installation, to use dedicated SaleorVersionCompatibilityValidator. It also doesnt "coerce" version anymore, but uses "includePrelease" flag instead. This should match actual Saleor versioning better
