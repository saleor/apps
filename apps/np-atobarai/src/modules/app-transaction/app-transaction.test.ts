import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import { AppTransaction } from "./app-transaction";

describe("AppTransaction", () => {
  it("should return true for hasFulfillmentReported when saleorTrackingNumber is not null", () => {
    const transaction = new AppTransaction({
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      saleorTrackingNumber: "saleor_tracking_number",
    });

    expect(transaction.hasFulfillmentReported()).toBe(true);
  });

  it("should return false for hasFulfillmentReported when saleorTrackingNumber is null", () => {
    const transaction = new AppTransaction({
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      saleorTrackingNumber: null,
    });

    expect(transaction.hasFulfillmentReported()).toBe(false);
  });
});
