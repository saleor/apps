import { describe, expect, it } from "vitest";
import { taxProviderUtils } from "./tax-provider-utils";
import { TaxCriticalError } from "./tax-error";

describe("taxProviderUtils", () => {
  describe("resolveOptionalOrThrowUnexpectedError", () => {
    it("throws an error if value is undefined", () => {
      expect(() =>
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          undefined,
          new TaxCriticalError("test"),
        ),
      ).toThrowError();
    });

    it("returns value if value is not undefined", () => {
      expect(
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          "test",
          new TaxCriticalError("error"),
        ),
      ).toBe("test");
    });
  });
});
