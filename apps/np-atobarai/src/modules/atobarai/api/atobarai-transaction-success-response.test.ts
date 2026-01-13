import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import {
  AtobaraiTransactionSuccessResponse,
  createAtobaraiTransactionSuccessResponse,
  CreditCheckResult,
  FailedReason,
  PendingReason,
} from "./atobarai-transaction-success-response";

describe("createAtobaraiTransactionSuccessResponse", () => {
  it("should successfully parse a CreditCheckResult.Success response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.Success,
        },
      ],
    };

    const result = createAtobaraiTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "00",
            "np_transaction_id": "np_trans_id",
          },
        ],
      }
    `);
  });

  it("should successfully parse a CreditCheckResult.Pending response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.Pending,
          authori_hold: [
            PendingReason.LackOfAddressInformation,
            PendingReason.AddressConfirmationOfWork,
          ],
        },
      ],
    };

    const result = createAtobaraiTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_hold": [
              "RE009",
              "RE014",
            ],
            "authori_result": "10",
            "np_transaction_id": "np_trans_id",
          },
        ],
      }
    `);
  });

  it("should successfully parse a CreditCheckResult.Failed response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.Failed,
          authori_ng: FailedReason.ExcessOfTheAmount,
        },
      ],
    };

    const result = createAtobaraiTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_ng": "RE001",
            "authori_result": "20",
            "np_transaction_id": "np_trans_id",
          },
        ],
      }
    `);
  });

  it("should successfully parse a CreditCheckResult.BeforeReview response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.BeforeReview,
        },
      ],
    };

    const result = createAtobaraiTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "40",
            "np_transaction_id": "np_trans_id",
          },
        ],
      }
    `);
  });

  it("should successfully parse multiple transaction results", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_trans_42",
          authori_result: "00",
        },
        {
          np_transaction_id: "np_trans_21",
          authori_result: "10",
          authori_hold: ["RE009"],
        },
        {
          np_transaction_id: "np_trans_37",
          authori_result: "20",
          authori_ng: "RE001",
        },
      ],
    };

    const result = createAtobaraiTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "00",
            "np_transaction_id": "np_trans_42",
          },
          {
            "authori_hold": [
              "RE009",
            ],
            "authori_result": "10",
            "np_transaction_id": "np_trans_21",
          },
          {
            "authori_ng": "RE001",
            "authori_result": "20",
            "np_transaction_id": "np_trans_37",
          },
        ],
      }
    `);
  });

  it("should successfully parse any authori_result value", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: "99", // Any string is valid
        },
      ],
    };

    const result = createAtobaraiTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "99",
            "np_transaction_id": "np_trans_id",
          },
        ],
      }
    `);
  });

  it("should throw AtobaraiTransactionSuccessResponseValidationError when np_transaction_id is missing", () => {
    const rawResponse = {
      results: [
        {
          authori_result: "00",
          // Missing np_transaction_id
        },
      ],
    };

    expect(() =>
      createAtobaraiTransactionSuccessResponse(rawResponse),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [AtobaraiTransactionSuccessResponseValidationError: [
        {
          "code": "invalid_type",
          "expected": "string",
          "received": "undefined",
          "path": [
            "results",
            0,
            "np_transaction_id"
          ],
          "message": "Required"
        }
      ]
      ZodValidationError: Validation error: Required at "results[0].np_transaction_id"
      Invalid Atobarai transaction success response format: Validation error: Required at "results[0].np_transaction_id"]
    `,
    );
  });

  it("shouldn't be assignable without createAtobaraiRegisterTransactionSuccessResponse", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiTransactionSuccessResponse = { results: [] };

    expect(testValue).toStrictEqual({ results: [] });
  });
});
