import { describe, expect, it } from "vitest";
import { AlgoliaErrorParser } from "./algolia-error-parser";

describe("AlgoliaErrorParser", () => {
  describe("isAuthError", () => {
    it("Returns false if cant parse", () => {
      expect(
        AlgoliaErrorParser.isAuthError({
          foo: "bar",
        }),
      ).toBe(false);
    });

    it("Returns true if 401 or 403 status attached to error", () => {
      expect(
        AlgoliaErrorParser.isAuthError({
          status: 401,
        }),
      ).toBe(true);

      expect(
        AlgoliaErrorParser.isAuthError({
          status: 403,
        }),
      ).toBe(true);
    });

    it.each([200, 400, 500])("Returns false for status: %s", (statusCode) => {
      expect(
        AlgoliaErrorParser.isAuthError({
          status: statusCode,
        }),
      ).toBe(false);
    });
  });
});
