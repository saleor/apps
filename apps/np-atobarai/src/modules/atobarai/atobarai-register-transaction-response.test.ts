import { describe, expect, it } from "vitest";

import {
  AtobaraiRegisterTransactionErrorResponse,
  AtobaraiRegisterTransactionSuccessResponse,
  createAtobaraiRegisterTransactionErrorResponse,
  createAtobaraiRegisterTransactionSuccessResponse,
} from "./atobarai-register-transaction-response";

describe("createAtobaraiRegisterTransactionErrorResponse", () => {
  it("should successfully parse a valid error response", () => {
    const rawResponse = {
      errors: [
        {
          codes: ["ERR001", "ERR002"],
          id: "transaction_123",
        },
        {
          codes: ["ERR003"],
          id: "transaction_456",
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionErrorResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "errors": [
          {
            "codes": [
              "ERR001",
              "ERR002",
            ],
            "id": "transaction_123",
          },
          {
            "codes": [
              "ERR003",
            ],
            "id": "transaction_456",
          },
        ],
      }
    `);
  });

  it("should parse error response with empty errors array", () => {
    const rawResponse = {
      errors: [],
    };

    const result = createAtobaraiRegisterTransactionErrorResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "errors": [],
      }
    `);
  });

  it("should throw ZodError when response is missing errors field", () => {
    const rawResponse = {
      results: [],
    };

    expect(() => createAtobaraiRegisterTransactionErrorResponse(rawResponse))
      .toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "invalid_type",
          "expected": "array",
          "received": "undefined",
          "path": [
            "errors"
          ],
          "message": "Required"
        }
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiRegisterTransactionErrorResponse", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiRegisterTransactionErrorResponse = { errors: [] };

    expect(testValue).toStrictEqual({ errors: [] });
  });
});

describe("createAtobaraiRegisterTransactionSuccessResponse", () => {
  it("should successfully parse a PassedAtobaraiTransaction response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_123456",
          authori_result: "00",
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

  it("should successfully parse a PendingAtobaraiTransaction response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_789012",
          authori_result: "10",
          authori_hold: ["RE009", "RE014"],
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

  it("should successfully parse a FailedAtobaraiTransaction response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_345678",
          authori_result: "20",
          authori_ng: "NG001",
        },
      ],
    };

    const result = createAtobaraiRegisterTransactionSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "authori_ng": "NG001",
            "authori_result": "20",
            "np_transaction_id": "np_345678",
          },
        ],
      }
    `);
  });

  it("should successfully parse a BeforeReviewTransaction response", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_901234",
          authori_result: "40",
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
          authori_ng: "NG002",
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
            "authori_ng": "NG002",
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
