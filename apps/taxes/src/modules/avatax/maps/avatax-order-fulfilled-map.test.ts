import { describe, expect, it } from "vitest";
import {
  CommitTransactionMapPayloadArgs,
  avataxOrderFulfilledMaps,
} from "./avatax-order-fulfilled-map";
import { OrderFulfilledSubscriptionFragment, OrderStatus } from "../../../../generated/graphql";
import { DocumentType } from "avatax/lib/enums/DocumentType";

const MOCKED_METADATA: OrderFulfilledSubscriptionFragment["privateMetadata"] = [
  {
    key: avataxOrderFulfilledMaps.providerOrderIdKey,
    value: "transaction-code",
  },
];

const MOCKED_MAP_PAYLOAD_ARGS: CommitTransactionMapPayloadArgs = {
  order: {
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
  },
  config: {
    companyCode: "DEFAULT",
    isAutocommit: true,
    isSandbox: true,
    name: "Avatax-1",
    shippingTaxCode: "FR000000",
    credentials: {
      password: "user-password",
      username: "user-name",
    },
  },
};

describe("avataxOrderFulfilledMaps", () => {
  describe("getTransactionCodeFromMetadata", () => {
    it("should return transaction code", () => {
      expect(avataxOrderFulfilledMaps.getTransactionCodeFromMetadata(MOCKED_METADATA)).toBe(
        "transaction-code"
      );
    });

    it("should throw error when transaction code not found", () => {
      expect(() => avataxOrderFulfilledMaps.getTransactionCodeFromMetadata([])).toThrowError();
    });
  });
  describe("mapPayload", () => {
    it("should return mapped payload", () => {
      const mappedPayload = avataxOrderFulfilledMaps.mapPayload(MOCKED_MAP_PAYLOAD_ARGS);

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
});
