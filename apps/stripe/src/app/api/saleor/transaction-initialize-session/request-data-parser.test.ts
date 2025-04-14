import { describe, expect, it } from "vitest";

import {
  createFromTransactionInitalizeSessionData,
  TransactionInitalizeRequestData,
  UnsupportedPaymentMethodError,
  ValidationError,
} from "@/app/api/saleor/transaction-initialize-session/request-data-parser";

describe("createFromTransactionInitalizeSessionData", () => {
  it("should parse valid data coming from storefront", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "card",
      },
    };

    const result = createFromTransactionInitalizeSessionData(storefrontData);

    expect(result._unsafeUnwrap()).toStrictEqual({
      paymentIntent: {
        paymentMethod: "card",
      },
    });
  });

  it("should return UnsupportedPaymentMethodError if storefront sends unsupported payment method", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "my-pay",
      },
    };

    const result = createFromTransactionInitalizeSessionData(storefrontData);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnsupportedPaymentMethodError);
  });

  it("should return ValidationError if storefront sends invalid data (e.g additional field we dont support)", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "card",
        additionalField: "invalidValue",
      },
    };
    const result = createFromTransactionInitalizeSessionData(storefrontData);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ValidationError);
  });

  it("shouldn't be assignable without createFromTransactionInitalizeSessionData", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: TransactionInitalizeRequestData = {};

    expect(testValue).toStrictEqual({});
  });
});
