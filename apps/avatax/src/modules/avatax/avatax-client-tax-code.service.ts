import Avatax from "avatax";
import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import { FetchResult } from "avatax/lib/utils/fetch_result";
import { z } from "zod";

import { BaseError } from "@/error";

import { createLogger } from "../../logger";

const AvataxErrorShape = z.object({
  code: z.string(),
});

export class AvataxClientTaxCodeService {
  static AvataxClientTaxCodeServiceError = BaseError.subclass("AvataxClientTaxCodeServiceError");
  static ForbiddenAccessError =
    this.AvataxClientTaxCodeServiceError.subclass("ForbiddenAccessError");

  // * These are the tax codes that we don't want to show to the user. For some reason, Avatax has them as active.
  private readonly notSuitableKeys = ["Expired Tax Code - Do Not Use"];
  private logger = createLogger("AvataxClientTaxCodeService");

  constructor(private client: Pick<Avatax, "listTaxCodes">) {}

  private filterOutInvalid(response: FetchResult<TaxCodeModel>) {
    return response.value.filter((taxCode) => {
      return (
        taxCode.isActive &&
        taxCode.description &&
        !this.notSuitableKeys.includes(taxCode.description)
      );
    });
  }

  async getFilteredTaxCodes({ filter }: { filter: string | null }) {
    const result = await this.client
      .listTaxCodes({
        ...(filter ? { filter: `taxCode contains "${filter}"` } : {}),
        top: 50,
      })
      .catch((error) => {
        this.logger.error("Failed to call listTaxCodes on Avatax client", {
          error,
        });

        try {
          const parsedError = AvataxErrorShape.parse(error);

          /*
           * Catch specific client error so it's returned to the frontend
           * https://linear.app/saleor/issue/SHOPX-1189/
           */
          if (parsedError.code === "PermissionRequired") {
            throw new AvataxClientTaxCodeService.ForbiddenAccessError(
              "PermissionRequired error was returned from Avatax",
              {
                cause: error,
              },
            );
          }

          // Throw other errors like usual
          throw error;
        } catch (outerError) {
          throw outerError;
        }
      });

    return this.filterOutInvalid(result);
  }
}
