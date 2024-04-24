import { OrderStatus } from "@saleor/webhook-utils/generated/graphql";
import { OrderConfirmedPayload } from "../../webhooks/payloads/order-confirmed-payload";
import { SaleorOrderLineMockFactory } from "../order-line-mocks";
import { SaleorOrderConfirmedEvent } from "./event";

export class SaleorOrderConfirmedEventFactory {
  static graphqlPayload = {
    order: {
      id: "order-id",
      number: "order-number",
      created: "2021-01-01T00:00:00Z",
      status: OrderStatus.Fulfilled,
      discounts: [],
      channel: {
        id: "channel-id",
        slug: "channel-slug",
        taxConfiguration: {
          pricesEnteredWithTax: true,
          taxCalculationStrategy: "TAX_APP" as const,
        },
      },
      shippingPrice: {
        gross: {
          amount: 10,
        },
        net: {
          amount: 10,
        },
      },
      total: {
        gross: {
          amount: 10,
        },
        net: {
          amount: 10,
        },
        tax: {
          amount: 0,
        },
        currency: "USD",
      },
      lines: [SaleorOrderLineMockFactory.graphqlPayload],
      __typename: "Order" as const,
    },
    __typename: "OrderConfirmed" as const,
  };

  static create(
    graphqlPayload: OrderConfirmedPayload = SaleorOrderConfirmedEventFactory.graphqlPayload,
  ) {
    const possibleOrderLine = SaleorOrderConfirmedEvent.createFromGraphQL(graphqlPayload);

    if (possibleOrderLine.isErr()) {
      throw possibleOrderLine.error;
    }

    return possibleOrderLine.value;
  }
}
