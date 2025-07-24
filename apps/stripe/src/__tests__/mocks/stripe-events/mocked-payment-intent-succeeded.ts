import Stripe from "stripe";

import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";

export const getMockedPaymentIntentSucceededEvent = (): Stripe.PaymentIntentSucceededEvent => {
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
    type: "payment_intent.succeeded",
    data: {
      object: {
        currency: "iqd",
        amount_received: 1013,
        amount_capturable: 1511,
        object: "payment_intent",
        amount: 1000,
        id: mockedStripePaymentIntentId,
        created: date,
        livemode: false,
        amount_details: {},
        application: null,
        application_fee_amount: null,
        automatic_payment_methods: null,
        canceled_at: null,
        cancellation_reason: null,
        capture_method: "automatic_async",
        client_secret: null,
        confirmation_method: "automatic",
        customer: null,
        description: null,
        last_payment_error: null,
        latest_charge: null,
        metadata: {
          saleor_transaction_id: mockedSaleorTransactionId,
          saleor_source_id: "checkout-id-123",
          saleor_source_type: "Checkout",
        },
        next_action: null,
        on_behalf_of: null,
        payment_method: null,
        payment_method_configuration_details: null,
        payment_method_options: null,
        payment_method_types: [],
        presentment_details: { presentment_amount: 0, presentment_currency: "usd" },
        processing: null,
        receipt_email: null,
        review: null,
        setup_future_usage: null,
        shipping: null,
        source: null,
        statement_descriptor: null,
        statement_descriptor_suffix: null,
        status: "succeeded",
        transfer_data: null,
        transfer_group: null,
      },
    },
  };
};
