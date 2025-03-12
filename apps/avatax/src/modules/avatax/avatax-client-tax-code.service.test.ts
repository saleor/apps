import { err } from "neverthrow";
import { describe, expect, it } from "vitest";

import { AvataxClientTaxCodeService } from "@/modules/avatax/avatax-client-tax-code.service";

import { AvataxForbiddenAccessError } from "../taxes/tax-error";

describe("AvataxClientTaxCodeService", () => {
  describe("getFilteredTaxCodes", () => {
    it("Throws ForbiddenAccessError error if Avatax returns AvataxForbiddenAccessError", () => {
      const service = new AvataxClientTaxCodeService({
        listTaxCodes() {
          return Promise.resolve(err(new AvataxForbiddenAccessError("Not permitted")));
        },
      });

      expect(() => service.getFilteredTaxCodes({ filter: "" })).rejects.toThrowError(
        AvataxClientTaxCodeService.ForbiddenAccessError,
      );
    });
  });
});
