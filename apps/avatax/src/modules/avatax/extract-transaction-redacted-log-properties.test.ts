import { describe, expect, it } from "vitest";

import { extractTransactionRedactedLogProperties } from "./extract-transaction-redacted-log-properties";

describe("extractTransactionRedactedLogProperties", () => {
  it("Does not contain shipping fields", () => {
    const result = extractTransactionRedactedLogProperties({
      lines: [],
      customerCode: "test",
      date: new Date(),
      addresses: {
        shipFrom: {
          city: "ShipFromCity",
          line1: "ShipFromLine1",
        },
        shipTo: {
          city: "ShipToCity",
          line1: "ShipToLine1",
        },
      },
    });

    const stringifiedResult = JSON.stringify(result);

    expect(stringifiedResult.includes("ShipFromCity")).toBe(false);
    expect(stringifiedResult.includes("ShipFromLine1")).toBe(false);
    expect(stringifiedResult.includes("ShipToCity")).toBe(false);
    expect(stringifiedResult.includes("ShipToLine1")).toBe(false);
  });
});
