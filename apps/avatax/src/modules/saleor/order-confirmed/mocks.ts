import { ResultOf } from "@/graphql";
import { SaleorOrderConfirmedEvent } from "@/modules/saleor";

import { OrderConfirmedFragment } from "../../../../graphql/subscriptions/OrderConfirmed";
import { OrderConfirmedPayload } from "../../webhooks/payloads/order-confirmed-payload";
import { SaleorOrderLineMockFactory } from "../order-line-mocks";

export class SaleorOrderConfirmedEventMockFactory {
  private static _getGraphqlPayload = () => {
    const o = {
      userEmail: "",
      avataxDocumentCode: null,
      avataxEntityCode: null,
      avataxCustomerCode: null,
      avataxTaxCalculationDate: null,
      user: {
        id: "id",
        avataxCustomerCode: null,
        email: "email@example.com",
      },
      id: "order-id",
      number: "order-number",
      created: "2021-01-01T00:00:00Z",
      status: "FULFILLED" as const,
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
      shippingAddress: {
        city: "Krakow",
        country: { code: "PL" },
        countryArea: "Malopolskie",
        postalCode: "12345",
        streetAddress1: "Jana Pawla 2",
        streetAddress2: "2137",
      },
      billingAddress: {
        city: "Krakow",
        country: { code: "PL" },
        countryArea: "Malopolskie",
        postalCode: "12345",
        streetAddress1: "Jana Pawla 2",
        streetAddress2: "2137",
      },
      total: {
        net: {
          amount: 10,
        },
        tax: {
          amount: 0,
        },
        currency: "USD",
      },
      lines: [SaleorOrderLineMockFactory.getGraphqlPayload()],
    } satisfies NonNullable<ResultOf<typeof OrderConfirmedFragment>>;

    return {
      order: o,
    } as const;
  };

  static create(graphqlPayload?: OrderConfirmedPayload) {
    const possibleOrderLine = SaleorOrderConfirmedEvent.createFromGraphQL(
      graphqlPayload ??
        (SaleorOrderConfirmedEventMockFactory._getGraphqlPayload() as OrderConfirmedPayload),
    );

    if (possibleOrderLine.isErr()) {
      throw possibleOrderLine.error;
    }

    return possibleOrderLine.value;
  }

  static getGraphqlPayload = () => SaleorOrderConfirmedEventMockFactory._getGraphqlPayload();
}
