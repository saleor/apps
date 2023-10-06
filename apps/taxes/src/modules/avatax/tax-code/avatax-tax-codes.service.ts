import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import type { TaxCode } from "../../taxes/tax-code";
import { TaxIncompleteResponseError } from "../../taxes/tax-error";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";

export class AvataxTaxCodesService {
  private client: AvataxClient;

  constructor(config: AvataxConfig) {
    this.client = new AvataxClient(config);
  }

  private adapt(taxCodes: TaxCodeModel[]): TaxCode[] {
    return taxCodes.map((item) => ({
      description: taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        item.description,
        new TaxIncompleteResponseError("Cannot resolve tax code description"),
      ),
      code: item.taxCode,
    }));
  }

  async getAll() {
    const response = await this.client.getTaxCodes();

    return this.adapt(response);
  }
}
