import { describe, it, expect } from "vitest";
import { mapPayloadArgsMocks } from "./mocks";
import { taxJarCalculateTaxesMaps } from "./taxjar-calculate-taxes-map";

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
