import { OrderLineFragment } from "../../../generated/graphql";
import { SaleorOrderLine } from "./order-line";

export class SaleorOrderLineMockFactory {
  private static graphqlPayload = {
    totalPrice: {
      gross: {
        amount: 10,
      },
      net: {
        amount: 10,
      },
      tax: {
        amount: 0,
      },
    },
    quantity: 1,
    productSku: "product-sku",
    productVariantId: "product-variant-id",
    productName: "product-name",
    unitPrice: {
      gross: {
        amount: 10,
      },
      net: {
        amount: 10,
      },
    },
  };

  static create(graphqlPayload: OrderLineFragment = SaleorOrderLineMockFactory.graphqlPayload) {
    const possibleOrderLine = SaleorOrderLine.createFromGraphQL(graphqlPayload);

    if (possibleOrderLine.isErr()) {
      throw possibleOrderLine.error;
    }

    return possibleOrderLine.value;
  }

  static getGraphqlPayload = () => SaleorOrderLineMockFactory.graphqlPayload;
}
