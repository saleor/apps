---
"saleor-app-taxes": patch
---

Fixed the error when checkout couldn't calculate taxes when no customerCode was provided. In calculate taxes, the customerCode is now derived from issuingPrincipal's id.
