import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";

import { createLogger } from "@/logger";

import type { TaxCode } from "../../taxes/tax-code";
import { TaxBadProviderResponseError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { AvataxClient } from "../avatax-client";

export class AvataxTaxCodesService {
  private logger = createLogger("AvataxTaxCodesService");

  constructor(private client: Pick<AvataxClient, "getFilteredTaxCodes">) {}

  private adapt(taxCodes: TaxCodeModel[]): TaxCode[] {
    return taxCodes.map((item) => ({
      description: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        item.description,
        new TaxBadProviderResponseError("Cannot resolve tax code description"),
      ),
      code: item.taxCode,
    }));
  }

  async getAllFiltered({ filter }: { filter: string | null }): Promise<TaxCode[]> {
    const response = await this.client.getFilteredTaxCodes({ filter }).catch((error) => {
      this.logger.error("Failed to fetch filtered tax codes", { error });

      throw error;
    });

    return this.adapt(response);
  }
}
