---
"saleor-app-payment-np-atobarai": patch
---

Fixed fulfillment-tracking-number-updated handler and changed order of validation. Now app will quit if transactions don't include app's own transactions quietly. Previously app was reporting warning for multiple transactions, even if none of them was created by Atobarai
