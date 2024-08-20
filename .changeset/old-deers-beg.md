---
"app-avatax": patch
---

Fix AvaTax app tax rate precision. Previously tax rate was send with 2 decimal places to Saleor, now it will be send with 6 decimal places (max of what AvaTax API returns).
