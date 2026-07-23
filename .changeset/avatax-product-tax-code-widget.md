---
"saleor-app-avatax": minor
---

Added a "AvaTax tax code" widget to the product details page in the Dashboard. It shows the product's tax class and the AvaTax tax code it maps to, and warns when a product has no tax class or its tax class isn't mapped (so AvaTax's default code would be used). Requires Saleor 3.22+.

This adds the `MANAGE_PRODUCTS` permission to the app (needed to read a product's tax class), so the app will ask for approval of the new permission.
