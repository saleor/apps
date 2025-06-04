---
"saleor-app-payment-stripe": patch
---

Fixed new config validation - now it will earlier catch mismatched PK and RK (live + test mix) and Sentry will not be called
