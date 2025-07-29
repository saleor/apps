import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import { TransactionRecord } from "./transaction-record";

describe("AppTransaction", () => {
  it("should return true for hasFulfillmentReported when saleorTrackingNumber is not null", () => {
    const transaction = new TransactionRecord({
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      saleorTrackingNumber: "saleor_tracking_number",
      fulfillmentMetadataShippingCompanyCode: null,
    });

    expect(transaction.hasFulfillmentReported()).toBe(true);
  });

  it("should return false for hasFulfillmentReported when saleorTrackingNumber is null", () => {
    const transaction = new TransactionRecord({
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      saleorTrackingNumber: null,
      fulfillmentMetadataShippingCompanyCode: null,
    });

    expect(transaction.hasFulfillmentReported()).toBe(false);
  });
});
