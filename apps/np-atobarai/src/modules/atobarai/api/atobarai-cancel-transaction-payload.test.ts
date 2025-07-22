import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import {
  AtobaraiCancelTransactionPayload,
  createAtobaraiCancelTransactionPayload,
} from "./atobarai-cancel-transaction-payload";

describe("createAtobaraiCancelTransactionPayload", () => {
  it("should create a valid AtobaraiCancelTransactionPayload", () => {
    const result = createAtobaraiCancelTransactionPayload({
      atobaraiTransactionId: mockedAtobaraiTransactionId,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "transactions": [
          {
            "np_transaction_id": "np_trans_id",
          },
        ],
      }
    `);
  });

  it("shouldn't be assignable without createAtobaraiCancelTransactionSuccessResponse", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiCancelTransactionPayload = { transactions: [] };

    expect(testValue).toStrictEqual({
      transactions: [],
    });
  });
});
