import { describe, expect, it } from "vitest";

import {
  AtobaraiRegisterTransactionErrorResponse,
  createAtobaraiRegisterTransactionErrorResponse,
} from "./atobarai-register-transaction-error-response";

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
