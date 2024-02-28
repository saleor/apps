import { describe, it, expect } from "vitest";
import { verifyCalculateTaxesPayload } from "./validate-webhook-payload";
import { CalculateTaxesPayload } from "./calculate-taxes-payload";
import { TaxIncompleteWebhookPayloadError } from "../taxes/tax-error";

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

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(TaxIncompleteWebhookPayloadError);
    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
      `[TaxIncompleteWebhookPayloadError: No lines found in taxBase]`,
    );
  });

  it("Returns error if address is empty in the payload", () => {
    const payload = getBasePayload();

    payload.taxBase.address = null;

    const result = verifyCalculateTaxesPayload(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(TaxIncompleteWebhookPayloadError);
    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
      `[TaxIncompleteWebhookPayloadError: No address found in taxBase]`,
    );
  });
});
