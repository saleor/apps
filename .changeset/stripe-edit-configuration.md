---
"saleor-app-payment-stripe": minor
---

Stripe configurations can now be edited. Before: a configuration was read-only once created, so
fixing a typo in its name or rotating leaked Stripe keys meant deleting it and creating a new one,
which also lost every channel assignment. Now: clicking a configuration name opens its own page
where the name and keys can be changed and the configuration can be deleted, while its channels
stay assigned. Pasting a new restricted key is optional — leaving the field empty keeps the saved
one. Switching a configuration to another Stripe account or between sandbox and live re-creates
its Stripe webhook automatically, and rotating keys clears any credential problems the app
reported for that configuration.
