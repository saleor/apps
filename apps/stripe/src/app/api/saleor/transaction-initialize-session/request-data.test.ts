import { describe, expect, it } from "vitest";

import {
  createFromTransactionInitalizeSessionData,
  TransactionInitalizeRequestData,
  UnsupportedPaymentMethodError,
  ValidationError,
} from "@/app/api/saleor/transaction-initialize-session/request-data";

describe("createFromTransactionInitalizeSessionData", () => {
  it("should parse valid data comming from storefront", () => {
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

  it("should return ValidationError if storefront sends invalid data (e.g addtional field we dont support)", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "card",
        addtionalField: "invalidValue",
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
