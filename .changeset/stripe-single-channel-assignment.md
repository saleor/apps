---
"saleor-app-payment-stripe": minor
---

Assigning one channel to a Stripe configuration is quicker, and taking a channel from another
configuration is now spelled out. Before: the only way to connect a channel was to open a
configuration card and pick channels from a multiselect, and a channel silently disappeared from
whichever configuration held it before. Now: every channel in the "channels not assigned" list has
its own "Assign to…" select that names each configuration together with its Sandbox or Live mode, so
a single channel can be connected in one click. When a card's multiselect pulls channels away from
other configurations, the card lists which channels move and where they come from before saving, and
a move that swaps sandbox keys for live ones (or the other way round) asks for confirmation first,
since it decides whether that channel takes real payments.
