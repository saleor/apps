import { describe, expect, it } from "vitest";
import { TaxIncompletePayloadErrors } from "../taxes/tax-error";
import { CalculateTaxesPayload } from "./payloads/calculate-taxes-payload";
import { verifyCalculateTaxesPayload } from "./validate-webhook-payload";

const getBasePayload = (): CalculateTaxesPayload => {
  return {
    __typename: "CalculateTaxes",
    recipient: {
      privateMetadata: [],
    },
    taxBase: {
      channel: {
        slug: "test",
      },
      currency: "PLN",
      discounts: [],
      pricesEnteredWithTax: false,
      shippingPrice: { amount: 0 },
      address: {
        city: "",
        country: {
          code: "PL",
        },
        countryArea: "",
        postalCode: "",
        streetAddress1: "",
        streetAddress2: "",
      },
      lines: [
        {
          quantity: 1,
          totalPrice: { amount: 100 },
          unitPrice: {
            amount: 100,
          },
          sourceLine: {
            __typename: "OrderLine",
            orderProductVariant: {
              __typename: "ProductVariant",
              id: "123",
              product: {
                taxClass: {
                  id: "321",
                  name: "fooo",
                },
              },
            },
            id: "1",
          },
        },
      ],
      sourceObject: {
        id: "123",
        avataxEntityCode: "",
        __typename: "Checkout",
        user: { __typename: "User", email: "", avataxCustomerCode: "", id: "" },
      },
    },
  };
};

describe("verifyCalculateTaxesPayload", () => {
  it("Returns error if lines are empty in the payload", () => {
    const payload = getBasePayload();

    payload.taxBase.lines = [];

    const result = verifyCalculateTaxesPayload(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(TaxIncompletePayloadErrors.MissingLinesError);
    expect(result._unsafeUnwrapErr().message).toBe("No lines found in taxBase");
  });

  it("Returns error if address is empty in the payload", () => {
    const payload = getBasePayload();

    payload.taxBase.address = null;

    const result = verifyCalculateTaxesPayload(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      TaxIncompletePayloadErrors.MissingAddressError,
    );
    expect(result._unsafeUnwrapErr().message).toBe("No address found in taxBase");
  });
});
