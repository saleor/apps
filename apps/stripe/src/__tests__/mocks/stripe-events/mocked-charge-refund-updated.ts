import Stripe from "stripe";

import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";

export const getMockedChargeRefundUpdatedEvent = (): Stripe.ChargeRefundUpdatedEvent => {
  // Stripe returns timestamp in seconds
  const date = new Date(2025, 1, 1).getTime() / 1000;

  return {
    account: "",
    api_version: "",
    request: { id: null, idempotency_key: null },
    object: "event",
    livemode: false,
    pending_webhooks: 0,
    id: "evt_event-id",
    created: date,
    type: "charge.refund.updated",
    data: {
      object: {
        currency: "usd",
        object: "refund",
        amount: 1000,
        id: "re_refund-id",
        created: date,
        metadata: {},
        presentment_details: { presentment_amount: 0, presentment_currency: "usd" },
        status: "succeeded",
        balance_transaction: null,
        charge: "ch_charge-id",
        payment_intent: mockedStripePaymentIntentId,
        reason: null,
        receipt_number: null,
        source_transfer_reversal: null,
        transfer_reversal: null,
      },
    },
  };
};
