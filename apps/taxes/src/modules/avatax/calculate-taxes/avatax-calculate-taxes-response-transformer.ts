import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { Response } from "./avatax-calculate-taxes-adapter";
import { AvataxCalculateTaxesResponseLinesTransformer } from "./avatax-calculate-taxes-response-lines-transformer";
import { AvataxCalculateTaxesResponseShippingTransformer } from "./avatax-calculate-taxes-response-shipping-transformer";

export class AvataxCalculateTaxesResponseTransformer {
  transform(response: TransactionModel): Response {
    const shippingTransformer = new AvataxCalculateTaxesResponseShippingTransformer();
    const shipping = shippingTransformer.transform(response);

    const linesTransformer = new AvataxCalculateTaxesResponseLinesTransformer();
    const lines = linesTransformer.transform(response);

    return {
      ...shipping,
      lines,
    };
  }
}
