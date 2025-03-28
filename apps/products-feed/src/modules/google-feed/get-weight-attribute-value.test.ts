import { describe, expect, it } from "vitest";

import { getWeightAttributeValue } from "./get-weight-attribute-value";

describe("getWeightAttributeValueTest", () => {
  it("Returns undefined, when weight is not provided", () => {
    expect(getWeightAttributeValue({ isShippingRequired: true })).toBe(undefined);
    expect(getWeightAttributeValue({ isShippingRequired: false })).toBe(undefined);
  });

  it("Returns undefined, when shipping is not required", () => {
    expect(getWeightAttributeValue({ isShippingRequired: false })).toBe(undefined);
    expect(
      getWeightAttributeValue({
        isShippingRequired: false,
        weight: { unit: "G", value: 10 },
      }),
    ).toBe(undefined);
  });

  it("Returns units in lowercase, when shipping and weight is provided", () => {
    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: "KG", value: 10 },
      }),
    ).toBe("10 kg");

    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: "LB", value: 5 },
      }),
    ).toBe("5 lb");
  });

  it("Returns weight with dot as decimal deliminiter, when float value is used", () => {
    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: "KG", value: 10.5 },
      }),
    ).toBe("10.5 kg");

    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: "OZ", value: 0.01 },
      }),
    ).toBe("0.01 oz");
  });
});
