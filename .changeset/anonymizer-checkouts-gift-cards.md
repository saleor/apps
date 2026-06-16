---
"saleor-app-anonymizer": minor
---

Anonymizer can now also erase checkouts and gift cards, so personal data held outside orders is removed too.

- **Checkouts:** the single-customer flow now also deletes that customer's checkouts (guest and registered, matched by the checkout email) before deleting the account, and the bulk flow gains a "Delete checkouts" action. Deleting a checkout removes all of its PII (email, billing/shipping address, linked user, metadata). This requires Saleor 3.23+ (where `checkoutDelete` exists); on older stores the checkout actions are skipped and shown disabled with a note. Checkouts with attached payment transactions cannot be deleted by Saleor and are reported as failures.
- **Gift cards:** a new "Gift cards" section with two explicitly-triggered, confirmation-gated actions. Gift card personal data is read-only in Saleor and cannot be scrubbed in place, so the card is deleted instead — which also permanently destroys its remaining balance, so the per-currency balance at risk is shown before you confirm. "Delete a customer's gift cards by email" matches on `createdByEmail` or `usedByEmail` (covering cards the customer redeemed as well as bought) for erasure requests; "Delete ALL gift cards" wipes every gift card, for sanitizing data copied to a dev/staging environment.

The app now requests two additional permissions, `MANAGE_CHECKOUTS` and `MANAGE_GIFT_CARD`.
