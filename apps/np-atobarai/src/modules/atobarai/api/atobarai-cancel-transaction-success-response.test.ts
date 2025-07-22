import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import { AtobaraiCancelTransactionPayload } from "./atobarai-cancel-transaction-payload";
import { createAtobaraiCancelTransactionSuccessResponse } from "./atobarai-cancel-transaction-success-response";

describe("createAtobaraiCancelTransactionSuccessResponse", () => {
  it("should create a valid AtobaraiCancelTransactionSuccessResponse", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
      ],
    };

    const result = createAtobaraiCancelTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
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
