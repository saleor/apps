---
"saleor-app-payment-np-atobarai": patch
---

Changed errors handling - now MalformedRequest returns 400 (as expected) instead of 500. This way we clearly distinguish between application failure and request that can't be processed. Additionally for async webhooks, Saleor will not retry the request. Also, errors from Atobarai API are logged as warnings, because usually they are related to incorrect business data (like addresses) - hence app should not indicate failures
