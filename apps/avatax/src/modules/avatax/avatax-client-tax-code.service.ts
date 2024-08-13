import Avatax from "avatax";
import { FetchResult } from "avatax/lib/utils/fetch_result";
import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import { createLogger } from "../../logger";
import { BaseError } from "@/error";
import { z } from "zod";

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

  constructor(private client: Avatax) {}

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
      .catch((err) => {
        this.logger.error("Failed to call listTaxCodes on Avatax client", { error: err });

        try {
          const parsedError = AvataxErrorShape.parse(err);

          /*
           * Catch specific client error so it's returned to the frontend
           * https://linear.app/saleor/issue/SHOPX-1189/
           */
          if (parsedError.code === "PermissionRequired") {
            throw new AvataxClientTaxCodeService.ForbiddenAccessError(
              "PermissionRequired error was returned from Avatax",
              {
                cause: err,
              },
            );
          }

          // Throw other errors like usual
          throw err;
        } catch (e) {
          throw err;
        }
      });

    return this.filterOutInvalid(result);
  }
}
