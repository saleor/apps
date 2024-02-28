import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { AvataxCalculateTaxesResponseLinesTransformer } from "./avatax-calculate-taxes-response-lines-transformer";
import { transformAvataxTransactionModelIntoShipping } from "./avatax-calculate-taxes-response-shipping-transformer";

export class AvataxCalculateTaxesResponseTransformer {
  transform(response: TransactionModel): CalculateTaxesResponse {
    const shipping = transformAvataxTransactionModelIntoShipping(response);
    const linesTransformer = new AvataxCalculateTaxesResponseLinesTransformer();
    const lines = linesTransformer.transform(response);

    return {
      ...shipping,
      lines,
    };
  }
}
