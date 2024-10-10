import { OrderLineFragment } from "graphql/subscriptions/OrderConfirmed";

import { ResultOf } from "@/graphql";

export class SaleorOrderLineMockFactory {
  private static graphqlPayload: ResultOf<typeof OrderLineFragment> = {
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
      net: {
        amount: 10,
      },
    },
    taxClass: null,
  };

  static getGraphqlPayload = () => SaleorOrderLineMockFactory.graphqlPayload;
}
