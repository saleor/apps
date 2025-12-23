import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";

import {
  AtobaraiFulfillmentReportSuccessResponse,
  createAtobaraiFulfillmentReportSuccessResponse,
} from "./atobarai-fulfillment-report-success-response";

describe("createAtobaraiFulfillmentReportSuccessResponse", () => {
  it("should successfully parse a valid response with single transaction", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
      ],
    };

    const result = createAtobaraiFulfillmentReportSuccessResponse(rawResponse);

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

  it("should successfully parse a valid response with multiple transactions", () => {
    const rawResponse = {
      results: [
        {
          np_transaction_id: "np_trans_42",
        },
        {
          np_transaction_id: "np_trans_21",
        },
        {
          np_transaction_id: "np_trans_37",
        },
      ],
    };

    const result = createAtobaraiFulfillmentReportSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [
          {
            "np_transaction_id": "np_trans_42",
          },
          {
            "np_transaction_id": "np_trans_21",
          },
          {
            "np_transaction_id": "np_trans_37",
          },
        ],
      }
    `);
  });

  it("should successfully parse a valid response with empty results array", () => {
    const rawResponse = {
      results: [],
    };

    const result = createAtobaraiFulfillmentReportSuccessResponse(rawResponse);

    expect(result).toMatchInlineSnapshot(`
      {
        "results": [],
      }
    `);
  });

  it("should throw validation error when results is missing", () => {
    const rawResponse = {};

    expect(() => createAtobaraiFulfillmentReportSuccessResponse(rawResponse)).toThrow(
      "Invalid Atobarai fulfillment report success response format: Required",
    );
  });

  it("should throw validation error when np_transaction_id is missing", () => {
    const rawResponse = {
      results: [
        {
          // missing np_transaction_id
        },
      ],
    };

    expect(() => createAtobaraiFulfillmentReportSuccessResponse(rawResponse)).toThrow(
      "Invalid Atobarai fulfillment report success response format: Required",
    );
  });

  it("shouldn't be assignable without createAtobaraiFulfillmentReportSuccessResponse", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiFulfillmentReportSuccessResponse = { results: [] };

    expect(testValue).toStrictEqual({ results: [] });
  });
});
