import { describe, expect, it } from "vitest";

import { scrambleAddress, scrambleDetails, scrambleUserDetails } from "./scramble";

describe("scrambleDetails", () => {
  it("blanks the names, clears the phone and fakes the street address", () => {
    const result = scrambleDetails({ firstName: "John", lastName: "Doe", phone: "1234567890" });

    expect(result).toStrictEqual({
      scrambledFirstName: "",
      scrambledLastName: "",
      scrambledPhone: "",
      scrambledStreetAddress1: "Anonymized",
    });
  });
});

describe("scrambleAddress", () => {
  it("returns null for a missing address", () => {
    expect(scrambleAddress(null)).toBeNull();
    expect(scrambleAddress(undefined)).toBeNull();
  });

  it("clears every free-text PII field and keeps the geographic ones", () => {
    const result = scrambleAddress({
      firstName: "John",
      lastName: "Doe",
      phone: "1234567890",
      city: "Berlin",
      postalCode: "10115",
      streetAddress1: "Sesame Street 1",
      countryArea: "BE",
      country: { code: "DE" },
    });

    expect(result).toStrictEqual({
      firstName: "",
      lastName: "",
      phone: "",
      streetAddress1: "Anonymized",
      streetAddress2: "",
      companyName: "",
      cityArea: "",
      city: "Berlin",
      postalCode: "10115",
      country: "DE",
      countryArea: "BE",
    });
  });
});

describe("scrambleUserDetails", () => {
  it("returns a UUID-based email under the configured domain and empty names", () => {
    const result = scrambleUserDetails("test.com");

    expect(result.firstName).toBe("");
    expect(result.lastName).toBe("");
    expect(result.email).toMatch(/^[a-f0-9-]+@test\.com$/);
  });
});
