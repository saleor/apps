import { describe, expect, it } from "vitest";

import { parseSaleorVersion, supportsCheckoutDeletion } from "./saleor-version";

describe("parseSaleorVersion", () => {
  it("parses major and minor from a full version string", () => {
    expect(parseSaleorVersion("3.23.0")).toStrictEqual({ major: 3, minor: 23 });
  });

  it("parses pre-release / suffixed versions", () => {
    expect(parseSaleorVersion("3.23.0a1")).toStrictEqual({ major: 3, minor: 23 });
    expect(parseSaleorVersion(" 3.24.1 ")).toStrictEqual({ major: 3, minor: 24 });
  });

  it("returns null for missing or invalid values", () => {
    expect(parseSaleorVersion(null)).toBeNull();
    expect(parseSaleorVersion(undefined)).toBeNull();
    expect(parseSaleorVersion("")).toBeNull();
    expect(parseSaleorVersion("not-a-version")).toBeNull();
  });
});

describe("supportsCheckoutDeletion", () => {
  it("is true for 3.23 and later", () => {
    expect(supportsCheckoutDeletion("3.23.0")).toBe(true);
    expect(supportsCheckoutDeletion("3.24.0")).toBe(true);
    expect(supportsCheckoutDeletion("4.0.0")).toBe(true);
  });

  it("is false for versions before 3.23", () => {
    expect(supportsCheckoutDeletion("3.22.0")).toBe(false);
    expect(supportsCheckoutDeletion("3.9.0")).toBe(false);
    expect(supportsCheckoutDeletion("2.99.0")).toBe(false);
  });

  it("fails closed for unknown versions", () => {
    expect(supportsCheckoutDeletion(null)).toBe(false);
    expect(supportsCheckoutDeletion(undefined)).toBe(false);
    expect(supportsCheckoutDeletion("garbage")).toBe(false);
  });
});
