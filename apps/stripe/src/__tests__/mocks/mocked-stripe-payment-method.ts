import Stripe from "stripe";

export const mockedStripeCardPaymentMethod: Stripe.PaymentMethod = {
  id: "pm_1234567890",
  object: "payment_method",
  billing_details: {
    address: {
      city: null,
      country: null,
      line1: null,
      line2: null,
      postal_code: null,
      state: null,
    },
    email: null,
    name: null,
    phone: null,
  },
  created: 1234567890,
  customer: null,
  livemode: false,
  type: "card",
  card: {
    brand: "visa",
    checks: {
      address_line1_check: null,
      address_postal_code_check: null,
      cvc_check: "pass",
    },
    country: "US",
    display_brand: "Visa",
    exp_month: 12,
    exp_year: 2025,
    fingerprint: "abc123",
    funding: "credit",
    generated_from: null,
    last4: "4242",
    networks: {
      available: ["visa"],
      preferred: null,
    },
    three_d_secure_usage: {
      supported: true,
    },
    wallet: null,
  },
  metadata: {},
};

export const mockedStripeOtherPaymentMethod: Stripe.PaymentMethod = {
  id: "pm_other_1234567890",
  object: "payment_method",
  billing_details: {
    address: {
      city: null,
      country: null,
      line1: null,
      line2: null,
      postal_code: null,
      state: null,
    },
    email: null,
    name: null,
    phone: null,
  },
  created: 1234567890,
  customer: null,
  livemode: false,
  type: "sepa_debit",
  metadata: {},
};
