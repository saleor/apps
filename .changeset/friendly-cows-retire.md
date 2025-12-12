---
"saleor-app-payment-np-atobarai": patch
---

Loosen validation of Atobarai error response. Now app will accept shape of errors containing arbitrary strings, without expecting their specific literal value.
