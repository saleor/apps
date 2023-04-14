import { describe, expect, it } from "vitest";
import { numbers } from "./numbers";

describe("roundFloatToTwoDecimals", () => {
  it("returns the correct value when multiple decimals", () => {
    const result = numbers.roundFloatToTwoDecimals(24.33333);

    expect(result).toBe(24.33);
  });

  it("returns the correct value when single decimal", () => {
    const result = numbers.roundFloatToTwoDecimals(24.3);

    expect(result).toBe(24.3);
  });

  it("returns the correct value when no decimals", () => {
    const result = numbers.roundFloatToTwoDecimals(24);

    expect(result).toBe(24);
  });
});
