# 5. Stripe app attaches Stripe Customers to Payment Intents

Date: 2026-10-30

Updated 2026-11-02: guests no longer get a Customer (see Alternatives considered).

## Status

Accepted

## Context

The Stripe app creates Payment Intents with amount, currency, payment method options and Saleor IDs in `metadata`. It never sends buyer data. Wallets (Apple Pay, Google Pay) fill `billing_details` themselves, so those payments show a name in Stripe Dashboard. Card payments made through the Payment Element do not collect a name by default, so most payments in Stripe Dashboard have no buyer name or email.

A storefront can already fix this per integration by passing `payment_method_data.billing_details` to `stripe.confirmPayment`. Merchants still expect the app to send the data that Saleor already holds.

Constraints:

- Merchants create a restricted key with the scopes listed in the app setup guide. Customers is not one of them, so existing keys cannot create Customers.
- `HANDLE_PAYMENTS` (the app's only Saleor permission) is enough to read `user`, `email`, `billingAddress` and `shippingAddress` on Checkout and Order.
- A Stripe Customer belongs to one Stripe account and one mode (test or live). Different channel configs can point to different accounts.
- `email` on a checkout is not verified. Anyone can type someone else's email.

Stripe guidance:

- Store Stripe Customer IDs against your own user model, and store your internal ID in Customer `metadata` for audit and search ([Customers](https://docs.stripe.com/billing/customer)).
- Do not put PII in `metadata` or `description` ([Metadata use cases](https://docs.stripe.com/metadata/use-cases)).
- Do not use the Search API for read-after-write flows: indexing can lag about one minute, longer during outages. Search is not available to businesses in India and is limited to 20 reads per second ([Search](https://docs.stripe.com/search)).
- Payments without a Customer are grouped as read-only guest customers, matched by email, phone or card. Guest customers can't hold saved payment methods ([Guest customers](https://docs.stripe.com/payments/checkout/guest-customers), [Guest customer FAQ](https://support.stripe.com/questions/guest-customer-faq)).
- Create a Customer when you need one for the buyer, skip it for anonymous one-off payments ([Customers](https://docs.stripe.com/billing/customer)).
- Radar reads email, name and addresses from the Customer object ([Radar integration](https://docs.stripe.com/radar/integration)).
- `receipt_email` sends a receipt in live mode regardless of the merchant's email settings ([Create a PaymentIntent](https://docs.stripe.com/api/payment_intents/create)).

## Decision

### Opt-in per Stripe config

- `StripeConfig` gets `customerCreationEnabled: boolean`. A missing value in DynamoDB reads as `false`, so existing configs keep today's behavior.
- The new and edit config forms get a checkbox. Enabling it (or changing the restricted key while it is enabled) runs a permission probe. If the key lacks **Customers — Write**, the save is rejected, the checkbox stays off and the UI tells the merchant which scope to add.
- On a new config the probe runs before the Stripe webhook is created, so a rejected save leaves nothing behind in Stripe.
- The setup guide lists **Customers — Write** as optional, needed only for this feature.
- Stripe has no API to read a restricted key's scopes. The probe calls `customers.update` on a non-existent Customer ID: a permission error means the scope is missing, `resource_missing` means it is present. Nothing is created. An integration test against a Stripe sandbox covers the key with the permission; the key without it is covered by unit tests only.

### Customer resolution in `TRANSACTION_INITIALIZE_SESSION`

Only when the config has `customerCreationEnabled`.

- **Signed-in buyer** (`user` is set; Saleor sets it from the authenticated session, so the storefront cannot forge it):
  - Look up `(saleorApiUrl, appId, configId, saleorUserId) → Stripe Customer ID` in DynamoDB. `configId` scopes the link to one Stripe account and mode.
  - If there is no link, create a Customer and save the link with a conditional put.
  - Customer `metadata`: `saleor_user_id`, `saleor_api_url`.
- **Guest** (`user` is null): no Customer and no `shipping`. The Payment Intent is created as before this change, so Stripe groups the payment as a guest customer. The buyer's name and address come from the `billing_details` the storefront sends at confirmation.
- Customers are never matched by email.
- Customer fields at creation: `email`, `name` (billing address → `User` → shipping address), `phone`, `address` (billing), `shipping`.
- Existing Customers are not updated. Details stay as they were on the first payment.
- For a signed-in buyer, the Payment Intent gets `customer` and `shipping` (this payment's shipping address).
- `receipt_email` is not set. Saleor sends its own order emails.
- The Customer create call uses the idempotency key `${event.idempotencyKey}:customer`. The Payment Intent already uses the raw key, and Stripe rejects one key on two endpoints.

### Failure handling

Customer handling never blocks a payment. On any failure the Payment Intent is created without `customer`, as before this change.

- **Permission error:** set `customerCreationEnabled = false` on the config and report an app problem that tells the merchant to add the scope and enable the feature again. Enabling it again clears the problem. The write is a conditional DynamoDB update of that one flag, so it can't overwrite keys a merchant is saving at the same time.
- **Stored Customer deleted in Stripe** (`resource_missing` on `customer`): delete the link and create the Payment Intent again without `customer`, under the idempotency key `${event.idempotencyKey}:without-customer` (the original key is already stored with other params). The next payment creates a new Customer.
- **Two first payments for one signed-in user at the same time:** the conditional put keeps one link. The other Customer stays unused.
- **Other errors:** log without PII and continue.

### Out of scope

- Updating Customers on later payments.
- Saved payment methods (`setup_future_usage`, Customer Sessions).
- Accounts v2 (customer-configured `Account`). It is in public preview outside Connect.

## Alternatives considered

- **Match Customers by email:** a guest could attach payments to another person's Customer. With saved payment methods this would expose cards. Rejected.
- **Find Customers with the Search API on `metadata["saleor_user_id"]`:** no storage needed, but not read-after-write safe (an immediate retry after a declined card creates a duplicate), not available in India, and rate-limited per account. Rejected.
- **Store the Customer ID in Saleor user `privateMetadata`:** matches Stripe's "store against your user model" literally, but needs `MANAGE_USERS`, so every merchant must approve a new permission. The key would also need to include the Stripe account. Rejected.
- **A new Customer for every guest payment** (like Checkout's `customer_creation: "always"`): shows the name for guests without storefront changes, but every guest order adds a Customer, and the payments lose Stripe's guest grouping and Guest badge. Rejected in favor of Stripe's guest model.
- **`shipping` on guest payments:** the app could send the shipping name and address. Rejected to leave guest payments exactly as Stripe's guest model expects.
- **`receipt_email` for guests:** forces Stripe receipts in live mode on top of Saleor emails. Rejected.
- **Make the Customers scope required:** every existing config would stop taking payments until the merchant rotates the key. Rejected.

## Consequences

- With the feature enabled, buyer name and email show for signed-in buyers' payments in Stripe Dashboard, whatever the payment method.
- Guest card payments show a name only if the storefront sends `billing_details`.
- A guest checkout that uses a registered customer's email stays a Stripe guest. Saleor may link the resulting order to that account when the checkout completes, but the payment starts before that, with no `user`.
- `TRANSACTION_INITIALIZE_SESSION` makes one more Stripe call (create Customer) on a signed-in buyer's first payment, plus one DynamoDB read (and a write on first payment) for signed-in buyers. Guest payments make no extra calls.
- A signed-in buyer's Customer keeps the details from their first payment until updating is added.
- The app stores a new DynamoDB entity: the Saleor user to Stripe Customer link.
- The integration tests' restricted key needs Customers — Write.
