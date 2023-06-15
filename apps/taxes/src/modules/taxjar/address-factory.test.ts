import { describe, expect, it } from "vitest";
import { taxJarAddressFactory } from "./address-factory";

describe("taxJarAddressFactory", () => {
  describe("fromChannelAddress", () => {
    it("returns fields in the expected format", () => {
      const result = taxJarAddressFactory.fromChannelToTax({
        city: "LOS ANGELES",
        country: "US",
        state: "CA",
        street: "123 Palm Grove Ln",
        zip: "90002",
      });

      expect(result).toEqual({
        from_street: "123 Palm Grove Ln",
        from_city: "LOS ANGELES",
        from_state: "CA",
        from_zip: "90002",
        from_country: "US",
      });
    });
  });

  describe("fromSaleorAddress", () => {
    it("returns fields in the expected format with streetAddress1", () => {
      const result = taxJarAddressFactory.fromSaleorToTax({
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
        to_street: "123 Palm Grove Ln",
        to_city: "LOS ANGELES",
        to_state: "CA",
        to_zip: "90002",
        to_country: "US",
      });
    });

    it("returns fields in the expected format with streetAddress1 and streetAddress2", () => {
      const result = taxJarAddressFactory.fromSaleorToTax({
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
        to_street: "123 Palm Grove Ln",
        to_city: "LOS ANGELES",
        to_state: "CA",
        to_zip: "90002",
        to_country: "US",
      });
    });
  });
});
