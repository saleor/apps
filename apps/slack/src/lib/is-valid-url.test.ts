import { describe, it, expect } from "vitest";
import { isValidUrl } from "./is-valid-url";

describe("isValidUrl", () => {
  it("returns true for valid URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("returns false for invalid URL", () => {
    expect(isValidUrl("asdf")).toBe(false);
  });
});
