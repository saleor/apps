import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import type { TaxCode } from "../../taxes/tax-code";
import { FetchResult } from "avatax/lib/utils/fetch_result";
import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import { taxProviderUtils } from "../../taxes/tax-provider-utils";

export class AvataxTaxCodesService {
  private client: AvataxClient;

  constructor(config: AvataxConfig) {
    this.client = new AvataxClient(config);
  }

  private adapt(response: FetchResult<TaxCodeModel>): TaxCode[] {
    return response.value.map((item) => ({
      description: taxProviderUtils.resolveOptionalOrThrow(item.description),
      code: item.taxCode,
    }));
  }

  async getAll() {
    const response = await this.client.getTaxCodes();

    return this.adapt(response);
  }
}
