import { describe, expect, it } from "vitest";

import { CriticalError } from "../../error";
import { taxProviderUtils } from "./tax-provider-utils";

describe("taxProviderUtils", () => {
  describe("resolveOptionalOrThrowUnexpectedError", () => {
    it("throws an error if value is undefined", () => {
      expect(() =>
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
          undefined,
          new CriticalError("test"),
        ),
      ).toThrowError();
    });

    it("returns value if value is not undefined", () => {
      expect(
        taxProviderUtils.resolveOptionalOrThrowUnexpectedError("test", new CriticalError("error")),
      ).toBe("test");
    });
  });
});
