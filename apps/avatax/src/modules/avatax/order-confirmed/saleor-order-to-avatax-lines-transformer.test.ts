import { describe, expect, it } from "vitest";

import { SaleorOrderConfirmedEventMockFactory } from "../../saleor/order-confirmed/mocks";
import { SHIPPING_ITEM_CODE } from "../calculate-taxes/avatax-shipping-line";
import { DEFAULT_TAX_CLASS_ID } from "../constants";
import { PriceReductionDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { avataxConfigMock } from "./avatax-order-confirmed-payload-transformer.test";
import { SaleorOrderToAvataxLinesTransformer } from "./saleor-order-to-avatax-lines-transformer";

const matches: AvataxTaxCodeMatches = [];
const saleorOrderToAvataxLinesTransformer = new SaleorOrderToAvataxLinesTransformer();
const saleorConfirmedOrderEvent = SaleorOrderConfirmedEventMockFactory.create();
const discountsStrategy = new PriceReductionDiscountsStrategy();

describe("SaleorOrderToAvataxLinesTransformer", () => {
  it("should transform lines and shipping from order into product and shipping lines ", () => {
    const { order } = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

    expect(
      saleorOrderToAvataxLinesTransformer.transform({
        confirmedOrderEvent: saleorConfirmedOrderEvent,
        matches,
        avataxConfig: avataxConfigMock,
        discountsStrategy,
      }),
    ).toStrictEqual([
      {
        amount: order.lines[0].totalPrice.gross.amount,
        description: order.lines[0].productName,
        itemCode: order.lines[0].productSku,
        quantity: order.lines[0].quantity,
        taxCode: DEFAULT_TAX_CLASS_ID,
        taxIncluded: true,
        discounted: undefined,
      },
      {
        amount: order.shippingPrice.gross.amount,
        itemCode: SHIPPING_ITEM_CODE,
        quantity: 1,
        taxCode: avataxConfigMock.shippingTaxCode,
        taxIncluded: expect.any(Boolean),
        discounted: undefined,
      },
    ]);
  });

  it("should transform only lines from order into product if there is no shipping", () => {
    const orderConfirmedEventPayload = SaleorOrderConfirmedEventMockFactory.getGraphqlPayload();

    const saleorConfirmedOrderEventWithoutShipping = SaleorOrderConfirmedEventMockFactory.create({
      ...orderConfirmedEventPayload,
      order: {
        ...orderConfirmedEventPayload.order,
        shippingPrice: {
          gross: {
            amount: 0,
          },
          net: {
            amount: 0,
          },
        },
      },
    });

    const { order } = orderConfirmedEventPayload;

    expect(
      saleorOrderToAvataxLinesTransformer.transform({
        confirmedOrderEvent: saleorConfirmedOrderEventWithoutShipping,
        matches,
        avataxConfig: avataxConfigMock,
        discountsStrategy,
      }),
    ).toStrictEqual([
      {
        amount: order.lines[0].totalPrice.gross.amount,
        description: order.lines[0].productName,
        itemCode: order.lines[0].productSku,
        quantity: order.lines[0].quantity,
        taxCode: DEFAULT_TAX_CLASS_ID,
        taxIncluded: true,
        discounted: undefined,
      },
    ]);
  });
});
