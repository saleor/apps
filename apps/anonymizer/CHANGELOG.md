# saleor-app-anonymizer

## 1.1.0

### Minor Changes

- ff55014: Added the Anonymizer app to the monorepo. It lets you anonymize a customer's personal data directly from the Saleor Dashboard.

  - **Single customer:** look up a customer by email and scramble the billing and shipping details on all of their orders (names and phone cleared; street address line 2, company and district cleared; street address line 1 replaced with a placeholder; email replaced with a random address under a configurable domain; city/postal code/country area/country kept), then delete the customer account. Customers with more than one page of orders are fully covered, and accounts with no orders can still be erased.
  - **Bulk:** scan the whole store and anonymize every not-yet-processed order or delete all non-staff customer accounts in one run, with a progress bar. Anonymized orders are flagged so re-runs skip them and retry only failures.

  Destructive actions ask for confirmation first, and the app surfaces a warning that erasure covers only the standard orders, customers and addresses APIs. The app uses the shared monorepo tooling (ESLint, TypeScript and dependency catalog) and observability stack (Sentry, OpenTelemetry, structured logging, env validation).

- eec82ce: Anonymizer can now also erase checkouts and gift cards, so personal data held outside orders is removed too.

  - **Checkouts:** the single-customer flow now also deletes that customer's checkouts (guest and registered, matched by the checkout email) before deleting the account, and the bulk flow gains a "Delete checkouts" action. Deleting a checkout removes all of its PII (email, billing/shipping address, linked user, metadata). This requires Saleor 3.23+ (where `checkoutDelete` exists); on older stores the checkout actions are skipped and shown disabled with a note. Checkouts with attached payment transactions cannot be deleted by Saleor and are reported as failures.
  - **Gift cards:** a new "Gift cards" section with two explicitly-triggered, confirmation-gated actions. Gift card personal data is read-only in Saleor and cannot be scrubbed in place, so the card is deleted instead — which also permanently destroys its remaining balance, so the per-currency balance at risk is shown before you confirm. "Delete a customer's gift cards by email" matches on `createdByEmail` or `usedByEmail` (covering cards the customer redeemed as well as bought) for erasure requests; "Delete ALL gift cards" wipes every gift card, for sanitizing data copied to a dev/staging environment.

  The app now requests two additional permissions, `MANAGE_CHECKOUTS` and `MANAGE_GIFT_CARD`.

### Patch Changes

- eec82ce: Fixed the gift card by-email search missing cards sent to a customer. When a gift card is issued with "send to customer", the recipient email is stored only on a gift card event (not on `createdByEmail`/`usedByEmail`), so searching by that email returned nothing. The by-email flow now also matches the email recorded on the card's events, so recipient-only cards are found and erased.
