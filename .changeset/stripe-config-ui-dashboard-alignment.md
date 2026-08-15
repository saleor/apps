---
"saleor-app-payment-stripe": minor
---

Rebuilt the configuration screens to match Saleor Dashboard settings pages. Before: a single
list of configurations with a separate channel-mapping section and no guidance. Now: each
configuration is a card that shows the channels using it, with a Sandbox/Live badge, a
connected-channel count, per-channel disconnect, and a fold at the bottom of the card listing
channels that are not assigned yet. A "Finish Stripe setup" checklist walks through adding keys,
assigning channels and confirming webhooks, and stays reachable as a compact summary row after
being dismissed. Saving a new configuration now locks the form and save bar while it is in
flight, so a double click can no longer create a duplicate configuration. Key fields also name
the value they expect and the prefix it starts with, so pasting a secret key instead of a
restricted one is easier to catch before saving.
