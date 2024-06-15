import { describe, it, expect } from "vitest";
import { TypesenseErrorParser } from "./typesense-error-parser";

describe("TypesenseErrorParser", () => {
  describe("isAuthError", () => {
    it("Returns false if cant parse", () => {
      expect(
        TypesenseErrorParser.isAuthError({
          foo: "bar",
        }),
      ).toBe(false);
    });

    it("Returns true if 401 or 403 status attached to error", () => {
      expect(
        TypesenseErrorParser.isAuthError({
          status: 401,
        }),
      ).toBe(true);

      expect(
        TypesenseErrorParser.isAuthError({
          status: 403,
        }),
      ).toBe(true);
    });

    it.each([200, 400, 500])("Returns false for status: %s", (statusCode) => {
      expect(
        TypesenseErrorParser.isAuthError({
          status: statusCode,
        }),
      ).toBe(false);
    });
  });
});
