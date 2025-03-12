import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import { FetchResult } from "avatax/lib/utils/fetch_result";

import { BaseError } from "@/error";

import { AvataxForbiddenAccessError } from "../taxes/tax-error";
import { AvataxClient } from "./avatax-client";

export class AvataxClientTaxCodeService {
  static AvataxClientTaxCodeServiceError = BaseError.subclass("AvataxClientTaxCodeServiceError");
  static ForbiddenAccessError =
    this.AvataxClientTaxCodeServiceError.subclass("ForbiddenAccessError");

  // * These are the tax codes that we don't want to show to the user. For some reason, Avatax has them as active.
  private readonly notSuitableKeys = ["Expired Tax Code - Do Not Use"];

  constructor(private client: Pick<AvataxClient, "listTaxCodes">) {}

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
    const listTaxCodesResult = await this.client.listTaxCodes({ filter });

    if (listTaxCodesResult.isErr()) {
      if (listTaxCodesResult.error instanceof AvataxForbiddenAccessError) {
        throw new AvataxClientTaxCodeService.ForbiddenAccessError(
          "PermissionRequired error was returned from Avatax",
          {
            cause: listTaxCodesResult.error,
          },
        );
      }
      throw listTaxCodesResult.error;
    }

    return this.filterOutInvalid(listTaxCodesResult.value);
  }
}
