import { SaleorCalculateTaxesEvent } from "./event";

export class SaleorCalculateTaxesEventMockFactory {
  private static graphqlPayload = {
    taxBase: {
      pricesEnteredWithTax: false,
      currency: "USD",
      channel: {
        slug: "default-channel",
      },
      discounts: [],
      lines: [],
      shippingPrice: {
        amount: 0,
      },
      sourceObject: {
        id: "source-object-id",
        __typename: "Order" as const,
      },
      __typename: "TaxableObject" as const,
    },
    __typename: "CalculateTaxes" as const,
  };

  static create() {
    return SaleorCalculateTaxesEvent.createFromGraphQL(
      SaleorCalculateTaxesEventMockFactory.graphqlPayload,
    )._unsafeUnwrap();
  }

  static getGraphqlPayload = () => SaleorCalculateTaxesEventMockFactory.graphqlPayload;
}
