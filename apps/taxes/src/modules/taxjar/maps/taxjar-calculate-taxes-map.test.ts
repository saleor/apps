import { describe, expect, it } from "vitest";
import { mapPayloadArgsMocks } from "./mocks";
import { distributeDiscount, taxJarCalculateTaxesMaps } from "./taxjar-calculate-taxes-map";

describe("taxJarCalculateTaxesMaps", () => {
  describe("mapPayload", () => {
    it("should return payload containing line_items", () => {
      const payload = taxJarCalculateTaxesMaps.mapPayload(mapPayloadArgsMocks.default);

      expect(payload).toEqual({
        params: {
          from_country: "US",
          from_zip: "92093",
          from_state: "CA",
          from_city: "La Jolla",
          from_street: "9500 Gilman Drive",
          to_country: "US",
          to_zip: "90002",
          to_state: "CA",
          to_city: "LOS ANGELES",
          to_street: "123 Palm Grove Ln",
          shipping: 48.33,
          line_items: [
            {
              id: "T3JkZXJMaW5lOmY1NGQ1MWY2LTc1OTctNGY2OC1hNDk0LTFjYjZlYjRmOTlhMQ==",
              quantity: 3,
              unit_price: 84,
              discount: 0,
            },
            {
              id: "T3JkZXJMaW5lOjU1NTFjNTFjLTM5MWQtNGI0Ny04MGU0LWVjY2Q5ZjU4MjQyNQ==",
              quantity: 1,
              unit_price: 5.99,
              discount: 0,
            },
          ],
        },
      });
    });
  });
});

describe("distributeDiscount", () => {
  it("should return a numbers array thats sum is equal original sum - the discount", () => {
    const discount = 10;
    const nums = [42, 55, 67, 49];

    const originalSum = nums.reduce((acc, curr) => acc + curr, 0);
    const discountedSum = originalSum - discount;

    const result = distributeDiscount(discount, nums);
    const resultSum = result.reduce((acc, curr) => acc + curr, 0);

    expect(resultSum).toEqual(discountedSum);
  });
  it("should return a numbers array where all items are >= 0", () => {
    const discount = 10;
    const nums = [1, 2, 3, 5];

    const result = distributeDiscount(discount, nums);

    expect(result.every((num) => num >= 0)).toBeTruthy();
  });
  it("should throw an error when discount is greater than the sum of the numbers array", () => {
    const discount = 100;
    const nums = [1, 2, 3, 5];

    expect(() => distributeDiscount(discount, nums)).toThrowError();
  });
});
