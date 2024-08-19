---
"app-avatax": minor
---
Changed how AvaTax app reports non-taxable lines (shipping & product) to Saleor:
-  Now, the total gross and net amount will take into consideration discounts (if applied).
-  The tax rate for such lines will always be 0.
