import { describe, expect, it } from "vitest";
import { SaleorOrderLineMockFactory } from "../../saleor/order-line-mocks";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxOrderConfirmedPayloadLinesTransformer } from "./avatax-order-confirmed-payload-lines-transformer";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";

const matches: AvataxTaxCodeMatches = [];

describe("AvataxOrderConfirmedPayloadLinesTransformer", () => {
  it("should transform order lines into product lines", () => {
    const confirmedOrderTransformerData = {
      getIsDiscounted: () => false,
      getLines: () => [SaleorOrderLineMockFactory.create()],
      getIsTaxIncluded: () => false,
      getShippingAmount: () => 21,
      hasShipping: () => false,
    };

    expect(
      AvataxOrderConfirmedPayloadLinesTransformer.transform({
        confirmedOrderTransformerData,
        matches,
        avataxConfig: avataxConfigMock,
      }),
    ).toStrictEqual([
      {
        amount: expect.any(Number),
        description: expect.any(String),
        discounted: expect.any(Boolean),
        itemCode: expect.any(String),
        quantity: expect.any(Number),
        taxCode: expect.any(String),
        taxIncluded: expect.any(Boolean),
      },
    ]);
  });

  it("should transform shipping from order into shipping line", () => {
    const confirmedOrderTransformerData = {
      getIsDiscounted: () => false,
      getLines: () => [],
      getIsTaxIncluded: () => false,
      getShippingAmount: () => 21,
      hasShipping: () => true,
    };

    expect(
      AvataxOrderConfirmedPayloadLinesTransformer.transform({
        confirmedOrderTransformerData,
        matches,
        avataxConfig: avataxConfigMock,
      }),
    ).toEqual([
      {
        amount: expect.any(Number),
        discounted: expect.any(Boolean),
        itemCode: "Shipping",
        quantity: 1,
        taxCode: avataxConfigMock.shippingTaxCode,
        taxIncluded: expect.any(Boolean),
      },
    ]);
  });

  it("should transform lines and shipping from order into product and shipping lines ", () => {
    const confirmedOrderTransformerData = {
      getIsDiscounted: () => false,
      getLines: () => [SaleorOrderLineMockFactory.create()],
      getIsTaxIncluded: () => false,
      getShippingAmount: () => 21,
      hasShipping: () => true,
    };

    expect(
      AvataxOrderConfirmedPayloadLinesTransformer.transform({
        confirmedOrderTransformerData,
        matches,
        avataxConfig: avataxConfigMock,
      }),
    ).toEqual([
      {
        amount: expect.any(Number),
        description: expect.any(String),
        discounted: expect.any(Boolean),
        itemCode: expect.any(String),
        quantity: expect.any(Number),
        taxCode: expect.any(String),
        taxIncluded: expect.any(Boolean),
      },
      {
        amount: expect.any(Number),
        discounted: expect.any(Boolean),
        itemCode: "Shipping",
        quantity: 1,
        taxCode: avataxConfigMock.shippingTaxCode,
        taxIncluded: expect.any(Boolean),
      },
    ]);
  });
});
