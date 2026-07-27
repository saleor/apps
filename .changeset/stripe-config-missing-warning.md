---
"saleor-app-payment-stripe": patch
---

Stripe no longer raises an error alert when it receives webhook events for a configuration that no longer exists. This happens when a configuration is deleted but its webhook endpoint is still active in Stripe — something outside the app's control. The situation is now surfaced to you as an App Problem, prompting you to remove the orphaned webhook in your Stripe Dashboard.
