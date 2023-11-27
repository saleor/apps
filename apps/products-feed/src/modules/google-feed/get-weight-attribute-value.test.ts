import { describe, expect, it } from "vitest";
import { getWeightAttributeValue } from "./get-weight-attribute-value";
import { WeightUnitsEnum } from "../../../generated/graphql";

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
        weight: { unit: WeightUnitsEnum.G, value: 10 },
      }),
    ).toBe(undefined);
  });

  it("Returns units in lowercase, when shipping and weight is provided", () => {
    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: WeightUnitsEnum.Kg, value: 10 },
      }),
    ).toBe("10 kg");

    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: WeightUnitsEnum.Lb, value: 5 },
      }),
    ).toBe("5 lb");
  });

  it("Returns weight with dot as decimal deliminiter, when float value is used", () => {
    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: WeightUnitsEnum.Kg, value: 10.5 },
      }),
    ).toBe("10.5 kg");

    expect(
      getWeightAttributeValue({
        isShippingRequired: true,
        weight: { unit: WeightUnitsEnum.Oz, value: 0.01 },
      }),
    ).toBe("0.01 oz");
  });
});
