import { describe, expect, it } from "vitest";

import { resolveSaleorMoneyFromStripePaymentIntent } from "./resolve-saleor-money-from-stripe-payment-intent";

describe("resolveSaleorMoneyFromStripePaymentIntent", () => {
  it("when StripePaymentIntent has status: 'canceled' should use the 'amount' field", () => {
    const result = resolveSaleorMoneyFromStripePaymentIntent({
      status: "canceled",
      amount: 45689,
      amount_capturable: 0,
      amount_received: 0,
      currency: "jpy",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      SaleorMoney {
        "amount": 45689,
        "currency": "JPY",
      }
    `);
  });

  it("when StripePaymentIntent has status: 'requires_payment_method' should use the 'amount' field", () => {
    const result = resolveSaleorMoneyFromStripePaymentIntent({
      status: "requires_payment_method",
      amount: 12356,
      amount_capturable: 0,
      amount_received: 0,
      currency: "pln",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      SaleorMoney {
        "amount": 123.56,
        "currency": "PLN",
      }
    `);
  });

  it("when StripePaymentIntent has status: 'requires_capture' should use the 'amount_capturable' field", () => {
    const result = resolveSaleorMoneyFromStripePaymentIntent({
      status: "requires_capture",
      amount: 0,
      amount_capturable: 99978,
      amount_received: 0,
      currency: "eur",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      SaleorMoney {
        "amount": 999.78,
        "currency": "EUR",
      }
    `);
  });

  it("when StripePaymentIntent has other status should use the 'amount_received' field", () => {
    const result = resolveSaleorMoneyFromStripePaymentIntent({
      status: "succeeded",
      amount: 0,
      amount_capturable: 0,
      amount_received: 123456,
      currency: "usd",
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      SaleorMoney {
        "amount": 1234.56,
        "currency": "USD",
      }
    `);
  });
});
