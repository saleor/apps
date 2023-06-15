import { DocumentType } from "avatax/lib/enums/DocumentType";
import { describe, expect, it } from "vitest";
import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import {
  AvataxOrderFulfilledPayloadTransformer,
  PROVIDER_ORDER_ID_KEY,
  getTransactionCodeFromMetadata,
} from "./avatax-order-fulfilled-payload-transformer";

// todo: add AvataxOrderFulfilledMockGenerator

const MOCK_AVATAX_CONFIG: AvataxConfig = {
  companyCode: "DEFAULT",
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

const MOCKED_METADATA: OrderFulfilledSubscriptionFragment["privateMetadata"] = [
  {
    key: PROVIDER_ORDER_ID_KEY,
    value: "transaction-code",
  },
];

type OrderFulfilled = OrderFulfilledSubscriptionFragment;

const ORDER_FULFILLED_MOCK: OrderFulfilled = {
  id: "T3JkZXI6OTU4MDA5YjQtNDUxZC00NmQ1LThhMWUtMTRkMWRmYjFhNzI5",
  created: "2023-04-11T11:03:09.304109+00:00",
  privateMetadata: MOCKED_METADATA,
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

describe("getTransactionCodeFromMetadata", () => {
  it("returns transaction code", () => {
    expect(getTransactionCodeFromMetadata(MOCKED_METADATA)).toBe("transaction-code");
  });

  it("throws error when transaction code not found", () => {
    expect(() => getTransactionCodeFromMetadata([])).toThrowError();
  });
});

const transformer = new AvataxOrderFulfilledPayloadTransformer(MOCK_AVATAX_CONFIG);

const MOCKED_ORDER_FULFILLED_PAYLOAD: {
  order: OrderFulfilledSubscriptionFragment;
} = {
  order: ORDER_FULFILLED_MOCK,
};

describe("AvataxOrderFulfilledPayloadTransformer", () => {
  it("returns transformed payload", () => {
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
