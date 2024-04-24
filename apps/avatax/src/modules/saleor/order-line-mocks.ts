import { SaleorOrderLine } from "./order-line";

export class SaleorOrderLineMockFactory {
  public static graphqlPayload = {
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

  public static create() {
    const possibleOrderLine = SaleorOrderLine.createFromGraphQL(
      SaleorOrderLineMockFactory.graphqlPayload,
    );

    if (possibleOrderLine.isErr()) {
      throw possibleOrderLine.error;
    }

    return possibleOrderLine.value;
  }
}
