// write vitest tests for checking if taxProviderUtils.resolveOptionalOrThrow throws an error for undefined value

import { describe, expect, it } from "vitest";
import { taxProviderUtils } from "./tax-provider-utils";

describe("taxProviderUtils", () => {
  describe("resolveOptionalOrThrow", () => {
    it("throws a default error if value is undefined", () => {
      expect(() => taxProviderUtils.resolveOptionalOrThrow(undefined)).toThrowError();
    });
    it("throws a custom error if value is undefined", () => {
      expect(() =>
        taxProviderUtils.resolveOptionalOrThrow(undefined, new Error("test"))
      ).toThrowError("test");
    }),
      it("returns value if value is not undefined", () => {
        expect(taxProviderUtils.resolveOptionalOrThrow("test")).toBe("test");
      });
  });
});
