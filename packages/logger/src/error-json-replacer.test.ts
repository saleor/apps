import { BaseError } from "@saleor/errors";
import { describe, expect, it } from "vitest";

import { errorJsonReplacer } from "./error-json-replacer";

describe("errorJsonReplacer", () => {
  it("Serializes plain Error instead of dropping it to an empty object", () => {
    const result = JSON.parse(
      JSON.stringify({ error: new Error("Webhook Creation failed") }, errorJsonReplacer),
    );

    expect(result.error.name).toBe("Error");
    expect(result.error.message).toBe("Webhook Creation failed");
    expect(result.error.stack).toContain("Error: Webhook Creation failed");
  });

  it("Serializes nested cause", () => {
    const result = JSON.parse(
      JSON.stringify(
        { error: new Error("outer", { cause: new Error("inner") }) },
        errorJsonReplacer,
      ),
    );

    expect(result.error.cause.message).toBe("inner");
  });

  it("Leaves BaseError to its own toJSON", () => {
    const result = JSON.parse(
      JSON.stringify({ error: new BaseError("branded") }, errorJsonReplacer),
    );

    expect(result.error).toStrictEqual({ name: "BaseError", message: "branded" });
  });

  it("Passes through non-errors", () => {
    expect(JSON.stringify({ a: 1, b: "x" }, errorJsonReplacer)).toBe('{"a":1,"b":"x"}');
  });
});
