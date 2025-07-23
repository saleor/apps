import { describe, expect, it } from "vitest";

import {
  ParseError,
  parseTransactionInitializeSessionEventData,
  TransactionInitializeSessionEventData,
  UnsupportedPaymentMethodError,
} from "./event-data-parser";

describe("parseTransactionInitializeSessionEventData", () => {
  it("should parse valid data coming from storefront", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "card",
      },
    };

    const result = parseTransactionInitializeSessionEventData(storefrontData);

    expect(result._unsafeUnwrap()).toStrictEqual({
      paymentIntent: {
        paymentMethod: "card",
      },
    });
  });

  it("should parse valid iDEAL data coming from storefront", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "ideal",
      },
    };

    const result = parseTransactionInitializeSessionEventData(storefrontData);

    expect(result._unsafeUnwrap()).toStrictEqual({
      paymentIntent: {
        paymentMethod: "ideal",
      },
    });
  });

  it("should return UnsupportedPaymentMethodError if storefront sends unsupported payment method", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "my-pay",
      },
    };

    const result = parseTransactionInitializeSessionEventData(storefrontData);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnsupportedPaymentMethodError);
  });

  it("should return ParseError if storefront sends additional field we dont support for card payment method", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "card",
        additionalField: "invalidValue",
      },
    };
    const result = parseTransactionInitializeSessionEventData(storefrontData);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ParseError);
  });

  it("should return ParseError is storefront sends additional field we dont support", () => {
    const storefrontData = {
      paymentIntent: {
        paymentMethod: "card",
      },
      additionalField: "invalidValue",
    };
    const result = parseTransactionInitializeSessionEventData(storefrontData);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ParseError);
  });

  it("shouldn't be assignable without createFromTransactionInitalizeSessionData", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: TransactionInitializeSessionEventData = {};

    expect(testValue).toStrictEqual({});
  });
});
