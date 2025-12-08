---
"saleor-app-payment-np-atobarai": patch
---

Accept zipcode with format "xxx-xxxx" (dash). Previously app was throwing internally, because address library was expecting different format.
