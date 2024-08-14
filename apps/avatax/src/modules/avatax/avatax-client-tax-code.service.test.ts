import { describe, expect, it } from "vitest";

import { AvataxClientTaxCodeService } from "@/modules/avatax/avatax-client-tax-code.service";

describe("AvataxClientTaxCodeService", () => {
  describe("getFilteredTaxCodes", () => {
    it("Throws ForbiddenAccessError error if Avatax returns error.code 'PermissionRequired'", () => {
      const service = new AvataxClientTaxCodeService({
        listTaxCodes() {
          return Promise.reject({
            code: "PermissionRequired",
            message: "Not permitted",
            name: "Error",
            target: "CustomerAccountSetup",
          });
        },
      });

      expect(() => service.getFilteredTaxCodes({ filter: "" })).rejects.toThrowError(
        AvataxClientTaxCodeService.ForbiddenAccessError,
      );
    });
  });
});
