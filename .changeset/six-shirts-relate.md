---
"saleor-app-payment-np-atobarai": patch
"saleor-app-avatax": patch
"saleor-app-payment-stripe": patch
---

Changed some of Saleor webhook response statuses. 

Previously, app either returned 5xx (if we expect Saleor to retry) or 4xx (if we can't process, for various reasons, but we don't want a retry). 

Due to upcoming Saleor Circuit Breaker mechanism, we no longer can rely on 4xx status for every case. After this change, app will sometimes return status 202 in case of error. 

For example - when app is not configured, it's expected that 4xx is returned and Saleor will disable not configured app eventually. But in case of webhooks that are not processable _sometimes_, 
app will return ACCEPTED code and exit gracefully. This way, Saleor will not disable healthy webhooks, that can't be process under certain conditions
