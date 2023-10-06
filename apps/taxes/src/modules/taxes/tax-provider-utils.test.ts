// write vitest tests for checking if taxProviderUtils.resolveOptionalOrThrowUnexpectedError throws an error for undefined value

import { describe, expect, it } from "vitest";
import { taxProviderUtils } from "./tax-provider-utils";
import { TaxUnexpectedError } from "./tax-error";

describe("taxProviderUtils", () => {
  describe("resolveOptionalOrThrowUnexpectedError", () => {
    it("throws an error if value is undefined", () => {
      expect(() =>
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          undefined,
          new TaxUnexpectedError("test"),
        ),
      ).toThrowError();
    });

    it("returns value if value is not undefined", () => {
      expect(
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          "test",
          new TaxUnexpectedError("error"),
        ),
      ).toBe("test");
    });
  });
});
