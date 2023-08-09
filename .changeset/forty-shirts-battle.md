---
"saleor-app-taxes": minor
---

Added support for reading document code from metadata field `avataxDocumentCode`. The default value is the order id from Saleor. The value for the document code is sliced to be under 20 characters. The requirement comes from Avatax API.
