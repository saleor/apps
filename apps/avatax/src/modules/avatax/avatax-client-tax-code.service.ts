import Avatax from "avatax";
import { FetchResult } from "avatax/lib/utils/fetch_result";
import { TaxCodeModel } from "avatax/lib/models/TaxCodeModel";
import { createLogger } from "../../logger";

export class AvataxClientTaxCodeService {
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
    const result = await this.client.listTaxCodes({
      ...(filter ? { filter: `taxCode contains "${filter}"` } : {}),
      top: 50,
    });

    return this.filterOutInvalid(result);
  }
}
