import { describe, expect, it } from "vitest";

import { scrambleDetails, scrambleUserDetails } from "./scramble";

describe("scrambleDetails", () => {
  it("blanks the names and replaces the phone with a constant non-functional number", () => {
    const result = scrambleDetails({ firstName: "John", lastName: "Doe", phone: "1234567890" });

    expect(result).toStrictEqual({
      scrambledFirstName: "",
      scrambledLastName: "",
      scrambledPhone: "5551234567",
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
