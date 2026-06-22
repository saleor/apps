import { describe, expect, it } from "vitest";

import { formatCustomerName, isStaffAccount } from "./customer";

describe("isStaffAccount", () => {
  it("blocks staff accounts", () => {
    expect(isStaffAccount({ isStaff: true })).toBe(true);
  });

  it("allows customer accounts", () => {
    expect(isStaffAccount({ isStaff: false })).toBe(false);
  });
});

describe("formatCustomerName", () => {
  it("joins first and last name", () => {
    expect(
      formatCustomerName({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }),
    ).toBe("Ada Lovelace");
  });

  it("falls back to the email when the name is empty", () => {
    expect(formatCustomerName({ firstName: "", lastName: "", email: "guest@example.com" })).toBe(
      "guest@example.com",
    );
  });

  it("trims when only one name part is present", () => {
    expect(formatCustomerName({ firstName: "Ada", lastName: "", email: "ada@example.com" })).toBe(
      "Ada",
    );
  });
});
