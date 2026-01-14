---
"saleor-app-payment-np-atobarai": minor
---

Added granular error handling, which will return more precise error messages in cases of errors. Also many errors were handled, meaning "status 200" will be returned in case of valid event, that misses necessary data like payload required to process the request. Previously it was not handled and caused "status 500" reported to Saleor.
