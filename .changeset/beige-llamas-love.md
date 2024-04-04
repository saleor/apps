---
"app-avatax": patch
---

Changed how app resolves `avataxCustomerCode`:
1. Checkout or Order metadata (`avataxCustomerCode` key).
2. User metadata (`avataxCustomerCode` key).
3. User id. 
4. As a fallback app sends `0` to Avatax.
