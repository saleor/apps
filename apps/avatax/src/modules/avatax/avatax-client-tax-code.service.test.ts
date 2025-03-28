import { err } from "neverthrow";
import { describe, expect, it } from "vitest";

import { AvataxClientTaxCodeService } from "@/modules/avatax/avatax-client-tax-code.service";

import { AvataxForbiddenAccessError } from "../taxes/tax-error";

describe("AvataxClientTaxCodeService", () => {
  describe("getFilteredTaxCodes", () => {
    it("Throws ForbiddenAccessError error if Avatax returns AvataxForbiddenAccessError", async () => {
      const service = new AvataxClientTaxCodeService({
        listTaxCodes() {
          return Promise.resolve(err(new AvataxForbiddenAccessError("Not permitted")));
        },
      });

      await expect(() => service.getFilteredTaxCodes({ filter: "" })).rejects.toThrowError(
        AvataxClientTaxCodeService.ForbiddenAccessError,
      );
    });
  });
});
