---
"app-avatax": minor
---

Changed how AvaTax app reports non-taxable lines (shipping & product) to Saleor: 
* Now total gross and net amount will take into consideration discount (if applied)
* Tax rate for such lines will always be 0 
