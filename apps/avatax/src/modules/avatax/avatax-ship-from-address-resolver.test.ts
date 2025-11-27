import { describe, expect, it } from "vitest";

import { avataxShipFromAddressResolver } from "./avatax-ship-from-address-resolver";

describe("avataxShipFromAddressResolver", () => {
  const fallbackAddress = {
    street: "Fallback Street 123",
    city: "Fallback City",
    state: "CA",
    zip: "90210",
    country: "US",
  };

  describe("resolve", () => {
    it("should use metadata address when valid JSON is provided", () => {
      const metadataAddress = JSON.stringify({
        street: "Metadata Street 456",
        city: "Metadata City",
        state: "NY",
        zip: "10001",
        country: "US",
      });

      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: metadataAddress,
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Metadata Street 456",
        city: "Metadata City",
        region: "NY",
        postalCode: "10001",
        country: "US",
      });
    });

    it("should use fallback address when metadata is null", () => {
      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: null,
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should use fallback address when metadata is undefined", () => {
      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: undefined,
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should use fallback address when metadata is empty string", () => {
      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: "",
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should use fallback address when metadata JSON is invalid", () => {
      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: "invalid json",
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should use fallback address when metadata is missing required fields", () => {
      const incompleteMetadata = JSON.stringify({
        street: "Incomplete Street",
        city: "Incomplete City",
        // missing zip, country
      });

      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: incompleteMetadata,
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should handle non-string values in metadata by NOT converting them and using fallback address", () => {
      const metadataWithNumbers = JSON.stringify({
        street: 123,
        city: "Test City",
        state: "TX",
        zip: 12345,
        country: "US",
      });

      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: metadataWithNumbers,
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should use fallback address when metadata is not an object", () => {
      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: JSON.stringify("not an object"),
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });

    it("should use fallback address when metadata is an array", () => {
      const result = avataxShipFromAddressResolver.resolve({
        avataxShipFromAddress: JSON.stringify([1, 2, 3]),
        fallbackAddress,
      });

      expect(result).toStrictEqual({
        line1: "Fallback Street 123",
        city: "Fallback City",
        region: "CA",
        postalCode: "90210",
        country: "US",
      });
    });
  });
});
