import { describe, expect, it } from "vitest";

import { envCoercedNumber } from "./env-coerced-number";

describe("envCoercedNumber", () => {
  it("should coerce string number to number type", () => {
    const schema = envCoercedNumber(10);

    const result = schema.parse("42");

    expect(result).toBe(42);
    expect(typeof result).toBe("number");
  });

  it("should return default value when input is undefined", () => {
    const defaultValue = 100;
    const schema = envCoercedNumber(defaultValue);

    const result = schema.parse(undefined);

    expect(result).toBe(defaultValue);
  });

  it("should handle actual number input without coercion", () => {
    const schema = envCoercedNumber(10);

    const result = schema.parse(42);

    expect(result).toBe(42);
    expect(typeof result).toBe("number");
  });

  it("Should throw if incorrect string is passed", () => {
    const schema = envCoercedNumber(10);

    expect(() => schema.parse("asdf")).toThrowError();
  });
});
