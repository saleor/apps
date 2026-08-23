---
"saleor-app-payment-stripe": patch
---

Reloading a Stripe configuration page no longer briefly claims you lack permission. Before: the app
treated "Dashboard has not sent the user yet" the same as "user is missing a permission", so
reloading or deep-linking into a configuration page flashed "You do not have permission to access
this page" before the real page appeared. Now: the app waits until permissions are actually known
and shows a loading skeleton in the meantime, so the message only appears for users who really are
missing one.
