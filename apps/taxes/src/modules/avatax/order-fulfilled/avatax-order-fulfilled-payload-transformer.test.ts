import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import {
  AvataxOrderFulfilledPayloadTransformer,
  PROVIDER_ORDER_ID_KEY,
  getTransactionCodeFromMetadata,
} from "./avatax-order-fulfilled-payload-transformer";
import { describe, it, expect } from "vitest";
import { DocumentType } from "avatax/lib/enums/DocumentType";
import { Payload } from "./avatax-order-fulfilled-adapter";
import { taxMockFactory } from "../../taxes/tax-mock-factory";
import { avataxMockFactory } from "../avatax-mock-factory";

const MOCKED_METADATA: OrderFulfilledSubscriptionFragment["privateMetadata"] = [
  {
    key: PROVIDER_ORDER_ID_KEY,
    value: "transaction-code",
  },
];

describe("getTransactionCodeFromMetadata", () => {
  it("should return transaction code", () => {
    expect(getTransactionCodeFromMetadata(MOCKED_METADATA)).toBe("transaction-code");
  });

  it("should throw error when transaction code not found", () => {
    expect(() => getTransactionCodeFromMetadata([])).toThrowError();
  });
});

const transformer = new AvataxOrderFulfilledPayloadTransformer();

const MOCKED_ORDER_FULFILLED_PAYLOAD: Payload = {
  order: taxMockFactory.createOrderFulfilledMock({ privateMetadata: MOCKED_METADATA }),
  config: avataxMockFactory.createMockAvataxConfig(),
};

describe("AvataxOrderFulfilledPayloadTransformer", () => {
  it("should return transformed payload", () => {
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
