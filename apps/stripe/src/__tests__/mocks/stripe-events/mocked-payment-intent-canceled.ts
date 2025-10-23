import Stripe from "stripe";

import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";

import { mockedStripePaymentIntentId } from "../mocked-stripe-payment-intent-id";

export const getMockedPaymentIntentPaymentCanceledEvent = (): Stripe.PaymentIntentCanceledEvent => {
  // Stripe returns timestamp in seconds
  const date = new Date(2025, 1, 1).getTime() / 1000;

  return {
    type: "payment_intent.canceled",
    created: date,
    id: "evt_event-id",
    livemode: false,
    api_version: "",
    object: "event",
    request: { id: null, idempotency_key: null },
    pending_webhooks: 0,
    data: {
      object: {
        id: mockedStripePaymentIntentId,
        amount: 1000,
        amount_received: 1013,
        amount_capturable: 0,
        object: "payment_intent",
        currency: "usd",
        created: date,
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
        livemode: false,
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
        status: "canceled",
        transfer_data: null,
        transfer_group: null,
      },
    },
  };
};
