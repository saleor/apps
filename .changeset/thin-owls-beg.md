---
"saleor-app-taxes": patch
---

Fix returning 0 for line price if Avatax returns isItemTaxable: false. This happens in, f.e., certain states in the US where there is no sales tax. After the fix, the app will fall back to the original line price.
