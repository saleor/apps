import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it } from "vitest";
import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxOrderFulfilledPayloadTransformer } from "./avatax-order-fulfilled-payload-transformer";

// todo: add AvataxOrderFulfilledMockGenerator

const MOCK_AVATAX_CONFIG: AvataxConfig = {
  companyCode: "DEFAULT",
  isDocumentRecordingEnabled: true,
  isAutocommit: false,
  isSandbox: true,
  name: "Avatax-1",
  shippingTaxCode: "FR000000",
  address: {
    country: "US",
    zip: "10118",
    state: "NY",
    city: "New York",
    street: "350 5th Avenue",
  },
  credentials: {
    password: "password",
    username: "username",
  },
};

type OrderFulfilled = OrderFulfilledSubscriptionFragment;

const ORDER_FULFILLED_MOCK: OrderFulfilled = {
  id: "T3JkZXI6OTU4MDA5YjQtNDUxZC00NmQ1LThhMWUtMTRkMWRmYjFhNzI5",
  created: "2023-04-11T11:03:09.304109+00:00",
  avataxId: "transaction-code",
  channel: {
    id: "Q2hhbm5lbDoy",
    slug: "channel-pln",
  },
  shippingAddress: {
    streetAddress1: "123 Palm Grove Ln",
    streetAddress2: "",
    city: "LOS ANGELES",
    countryArea: "CA",
    postalCode: "90002",
    country: {
      code: "US",
    },
  },
  billingAddress: {
    streetAddress1: "123 Palm Grove Ln",
    streetAddress2: "",
    city: "LOS ANGELES",
    countryArea: "CA",
    postalCode: "90002",
    country: {
      code: "US",
    },
  },
  total: {
    net: {
      amount: 183.33,
    },
    tax: {
      amount: 12.83,
    },
  },
  shippingPrice: {
    net: {
      amount: 48.33,
    },
  },
  lines: [
    {
      productSku: "328223581",
      productName: "Monospace Tee",
      quantity: 1,
      unitPrice: {
        net: {
          amount: 90,
        },
      },
      totalPrice: {
        net: {
          amount: 90,
        },
        tax: {
          amount: 8.55,
        },
      },
    },
    {
      productSku: "328223580",
      productName: "Polyspace Tee",
      quantity: 1,
      unitPrice: {
        net: {
          amount: 45,
        },
      },
      totalPrice: {
        net: {
          amount: 45,
        },
        tax: {
          amount: 4.28,
        },
      },
    },
  ],
};

const MOCKED_ORDER_FULFILLED_PAYLOAD: {
  order: OrderFulfilledSubscriptionFragment;
} = {
  order: ORDER_FULFILLED_MOCK,
};

describe("AvataxOrderFulfilledPayloadTransformer", () => {
  it("throws error when no avataxId", () => {
    const transformer = new AvataxOrderFulfilledPayloadTransformer(MOCK_AVATAX_CONFIG);

    expect(() =>
      transformer.transform({
        ...MOCKED_ORDER_FULFILLED_PAYLOAD,
        order: {
          ...MOCKED_ORDER_FULFILLED_PAYLOAD.order,
          avataxId: null,
        },
      })
    ).toThrow();
  });
  it("returns document type of SalesOrder when isDocumentRecordingEnabled is false", () => {
    const transformer = new AvataxOrderFulfilledPayloadTransformer({
      ...MOCK_AVATAX_CONFIG,
      isDocumentRecordingEnabled: false,
    });

    const payload = transformer.transform(MOCKED_ORDER_FULFILLED_PAYLOAD);

    expect(payload.documentType).toBe(DocumentType.SalesOrder);
  }),
    it("returns document type of SalesInvoice when isDocumentRecordingEnabled is true", () => {
      const transformer = new AvataxOrderFulfilledPayloadTransformer(MOCK_AVATAX_CONFIG);

      const payload = transformer.transform(MOCKED_ORDER_FULFILLED_PAYLOAD);

      expect(payload.documentType).toBe(DocumentType.SalesInvoice);
    }),
    it("returns transformed payload", () => {
      const transformer = new AvataxOrderFulfilledPayloadTransformer(MOCK_AVATAX_CONFIG);

      const mappedPayload = transformer.transform(MOCKED_ORDER_FULFILLED_PAYLOAD);

      expect(mappedPayload).toEqual({
        transactionCode: "transaction-code",
        companyCode: "DEFAULT",
        documentType: DocumentType.SalesInvoice,
        model: {
          commit: true,
        },
      });
    });
});
