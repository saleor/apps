import { describe, expect, it } from "vitest";

import {
  AtobaraiRegisterTransactionSuccessResponse,
  createAtobaraiRegisterTransactionSuccessResponse,
  CreditCheckResult,
  FailedReason,
  PendingReason,
} from "./atobarai-register-transaction-success-response";

describe("createAtobaraiRegisterTransactionSuccessResponse", () => {
  it("should successfully parse a CreditCheckResult.Success response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_123456",
          authori_result: CreditCheckResult.Success,
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "00",
            "np_transaction_id": "np_123456",
          },
        ],
      }
    `);
  });

  it("should successfully parse a CreditCheckResult.Pending response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_789012",
          authori_result: CreditCheckResult.Pending,
          authori_hold: [
            PendingReason.LackOfAddressInformation,
            PendingReason.AddressConfirmationOfWork,
          ],
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_hold": [
              "RE009",
              "RE014",
            ],
            "authori_result": "10",
            "np_transaction_id": "np_789012",
          },
        ],
      }
    `);
  });

  it("should successfully parse a CreditCheckResult.Failed response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_345678",
          authori_result: CreditCheckResult.Failed,
          authori_ng: FailedReason.ExcessOfTheAmount,
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_ng": "RE001",
            "authori_result": "20",
            "np_transaction_id": "np_345678",
          },
        ],
      }
    `);
  });

  it("should successfully parse a CreditCheckResult.BeforeReview response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_901234",
          authori_result: CreditCheckResult.BeforeReview,
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "40",
            "np_transaction_id": "np_901234",
          },
        ],
      }
    `);
  });

  it("should successfully parse multiple transaction results", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_123456",
          authori_result: "00",
        },
        {
          np_transaction_id: "np_789012",
          authori_result: "10",
          authori_hold: ["RE009"],
        },
        {
          np_transaction_id: "np_345678",
          authori_result: "20",
          authori_ng: "RE001",
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_result": "00",
            "np_transaction_id": "np_123456",
          },
          {
            "authori_hold": [
              "RE009",
            ],
            "authori_result": "10",
            "np_transaction_id": "np_789012",
          },
          {
            "authori_ng": "RE001",
            "authori_result": "20",
            "np_transaction_id": "np_345678",
          },
        ],
      }
    `);
  });

  it("should throw ZodError when authori_result is invalid", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_123456",
          authori_result: "99", // Invalid result code
        },
      ],
    };

    expect(() => createAtobaraiRegisterTransactionSuccessResponse(rawResponse))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_union_discriminator",
          "options": [
            "00",
            "10",
            "20",
            "40"
          ],
          "path": [
            "results",
            0,
            "authori_result"
          ],
          "message": "Invalid discriminator value. Expected '00' | '10' | '20' | '40'"
        }
      ]]
    `);
  });

  it("should throw ZodError when np_transaction_id is missing", () => {
    const rawResponse = {
      results: [
        {
          authori_result: "00",
          // Missing np_transaction_id
        },
      ],
    };

    expect(() => createAtobaraiRegisterTransactionSuccessResponse(rawResponse))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
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
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiRegisterTransactionSuccessResponse", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiRegisterTransactionSuccessResponse = { results: [] };

    expect(testValue).toStrictEqual({ results: [] });
  });
});
