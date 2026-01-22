---
"saleor-app-payment-np-atobarai": patch
---

Changed refund logic that improperly matched refunds - now it uses transaction total instead order total to decide if refund is full
