import { describe, expect, it } from "vitest";

import { avataxAddressFactory } from "./address-factory";

describe("avataxAddressFactory", () => {
  describe("fromChannelAddress", () => {
    it("returns fields in the expected format", () => {
      const result = avataxAddressFactory.fromChannelAddress({
        city: "LOS ANGELES",
        country: "US",
        state: "CA",
        street: "123 Palm Grove Ln",
        zip: "90002",
      });

      expect(result).toEqual({
        line1: "123 Palm Grove Ln",
        city: "LOS ANGELES",
        region: "CA",
        postalCode: "90002",
        country: "US",
      });
    });
  });

  describe("fromSaleorAddress", () => {
    it("returns fields in the expected format with line1", () => {
      const result = avataxAddressFactory.fromSaleorAddress({
        streetAddress1: "123 Palm Grove Ln",
        streetAddress2: "",
        city: "LOS ANGELES",
        country: {
          code: "US",
        },
        countryArea: "CA",
        postalCode: "90002",
      });

      expect(result).toEqual({
        line1: "123 Palm Grove Ln",
        line2: "",
        city: "LOS ANGELES",
        region: "CA",
        postalCode: "90002",
        country: "US",
      });
    });

    it("returns fields in the expected format with line1 and line2", () => {
      const result = avataxAddressFactory.fromSaleorAddress({
        streetAddress1: "123 Palm",
        streetAddress2: "Grove Ln",
        city: "LOS ANGELES",
        country: {
          code: "US",
        },
        countryArea: "CA",
        postalCode: "90002",
      });

      expect(result).toEqual({
        line1: "123 Palm",
        line2: "Grove Ln",
        city: "LOS ANGELES",
        region: "CA",
        postalCode: "90002",
        country: "US",
      });
    });
  });
});
