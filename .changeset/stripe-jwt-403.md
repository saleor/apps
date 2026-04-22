---
"saleor-app-payment-stripe": patch
---

Fixed: when the dashboard session/JWT expires, the Stripe app now shows a clear "Session expired" message instead of a cryptic internal error. The backend correctly responds with HTTP 403 instead of 500, so expired sessions no longer show up as server errors in logs.
