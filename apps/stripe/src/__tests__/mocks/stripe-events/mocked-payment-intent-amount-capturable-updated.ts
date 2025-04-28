import Stripe from "stripe";

import { mockedStripePaymentIntentId } from "../mocked-stripe-payment-intent-id";

export const getMockedPaymentIntentAmountCapturableUpdatedEvent =
  (): Stripe.PaymentIntentAmountCapturableUpdatedEvent => {
    // Stripe returns timestamp in seconds
    const date = new Date(2025, 1, 1).getTime() / 1000;

    return {
      id: "evt_event-id",
      object: "event",
      api_version: "",
      created: date,
      data: {
        object: {
          id: mockedStripePaymentIntentId,
          object: "payment_intent",
          amount: 1000,
          amount_capturable: 1000,
          amount_details: {
            tip: {},
          },
          amount_received: 0,
          application: null,
          application_fee_amount: null,
          automatic_payment_methods: {
            allow_redirects: "always",
            enabled: true,
          },
          canceled_at: null,
          cancellation_reason: null,
          capture_method: "automatic_async",
          client_secret: null,
          confirmation_method: "automatic",
          created: date,
          currency: "usd",
          customer: null,
          description: null,
          last_payment_error: null,
          latest_charge: "ch_id",
          livemode: false,
          metadata: {},
          next_action: null,
          on_behalf_of: null,
          payment_method: "pm_id",
          payment_method_configuration_details: {
            id: "pmc_id",
            parent: null,
          },
          payment_method_options: {
            card: {
              capture_method: "manual",
              installments: null,
              mandate_options: null,
              network: null,
              request_three_d_secure: "automatic",
            },
          },
          payment_method_types: ["card"],
          processing: null,
          receipt_email: null,
          review: null,
          setup_future_usage: null,
          shipping: null,
          source: null,
          statement_descriptor: null,
          statement_descriptor_suffix: null,
          status: "requires_capture",
          transfer_data: null,
          transfer_group: null,
        },
      },
      livemode: false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
      type: "payment_intent.amount_capturable_updated",
    };
  };
