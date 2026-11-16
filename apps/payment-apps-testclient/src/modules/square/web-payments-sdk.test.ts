import { describe, expect, it, vi } from "vitest";

import {
  createSquareChargeVerificationDetails,
  createSquarePaymentRequest,
  findInitializedSquareMethod,
  type InitializedSquareMethod,
  type SquarePayments,
} from "./web-payments-sdk";

describe("Square Web Payments SDK helpers", () => {
  it("builds CHARGE verification details from trusted checkout data", () => {
    expect(
      createSquareChargeVerificationDetails({
        amount: 12.34,
        currency: "USD",
        contact: {
          email: " buyer@example.com ",
          billingAddress: {
            firstName: "Buyer",
            lastName: "Example",
            streetAddress1: "1 Main Street",
            city: "New York",
            countryArea: "NY",
            country: { code: "US" },
            postalCode: "10001",
          },
        },
      }),
    ).toStrictEqual({
      amount: "12.34",
      currencyCode: "USD",
      intent: "CHARGE",
      customerInitiated: true,
      sellerKeyedIn: false,
      billingContact: {
        givenName: "Buyer",
        familyName: "Example",
        email: "buyer@example.com",
        phone: undefined,
        addressLines: ["1 Main Street"],
        city: "New York",
        state: "NY",
        countryCode: "US",
        postalCode: "10001",
      },
    });
  });

  it("selects one initialized method from the discriminated union", () => {
    const applePay = { tokenize: async () => ({ status: "OK" }) };
    const methods: InitializedSquareMethod[] = [{ method: "apple-pay", instance: applePay }];

    expect(findInitializedSquareMethod(methods, "apple-pay")?.instance).toBe(applePay);
    expect(findInitializedSquareMethod(methods, "cash-app-pay")).toBeUndefined();
  });

  it("makes the Afterpay shipping-contact decision explicit", () => {
    const paymentRequest = {};
    const payments = {
      paymentRequest: vi.fn(() => paymentRequest),
    } as unknown as SquarePayments;

    expect(
      createSquarePaymentRequest({
        payments,
        method: "afterpay-clearpay",
        countryCode: "US",
        currencyCode: "USD",
        amount: 12.34,
      }),
    ).toBe(paymentRequest);
    expect(payments.paymentRequest).toHaveBeenCalledWith({
      countryCode: "US",
      currencyCode: "USD",
      total: {
        amount: "12.34",
        label: "Total",
      },
      requestShippingContact: false,
    });
  });

  it("does not add the Afterpay shipping contract to wallet requests", () => {
    const payments = {
      paymentRequest: vi.fn(() => ({})),
    } as unknown as SquarePayments;

    createSquarePaymentRequest({
      payments,
      method: "apple-pay",
      countryCode: "US",
      currencyCode: "USD",
      amount: 12.34,
    });

    expect(payments.paymentRequest).toHaveBeenCalledWith({
      countryCode: "US",
      currencyCode: "USD",
      total: {
        amount: "12.34",
        label: "Total",
      },
    });
  });
});
