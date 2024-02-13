import { TaxForOrderRes } from "taxjar/dist/types/returnTypes";
import {
  TaxJarCalculateTaxesResponse,
  TaxJarCalculateTaxesPayload,
} from "./taxjar-calculate-taxes-adapter";
import { TaxJarCalculateTaxesResponseLinesTransformer } from "./taxjar-calculate-taxes-response-lines-transformer";
import { TaxJarCalculateTaxesResponseShippingTransformer } from "./taxjar-calculate-taxes-response-shipping-transformer";
import { createLogger } from "../../../logger";

export class TaxJarCalculateTaxesResponseTransformer {
  private logger = createLogger("TaxJarCalculateTaxesResponseTransformer");

  transform(
    payload: TaxJarCalculateTaxesPayload,
    response: TaxForOrderRes,
  ): TaxJarCalculateTaxesResponse {
    /*
     * TaxJar operates on the idea of sales tax nexus. Nexus is a place where the company has a physical presence.
     * If the company has no nexus in the state where the customer is located, the company is not required to collect sales tax.
     * Therefore, if has_nexus = false, we don't calculate taxes and return the same values as in the payload.
     * See: https://www.taxjar.com/sales-tax/nexus
     */
    if (!response.tax.has_nexus) {
      this.logger.warn("The company has no nexus in the state where the customer is located");
      return {
        shipping_price_net_amount: payload.taxBase.shippingPrice.amount,
        shipping_price_gross_amount: payload.taxBase.shippingPrice.amount,
        shipping_tax_rate: 0,
        lines: payload.taxBase.lines.map((line) => ({
          total_gross_amount: line.totalPrice.amount,
          total_net_amount: line.totalPrice.amount,
          tax_rate: 0,
        })),
      };
    }

    const shippingTransformer = new TaxJarCalculateTaxesResponseShippingTransformer();
    const linesTransformer = new TaxJarCalculateTaxesResponseLinesTransformer();

    const shipping = shippingTransformer.transform(payload.taxBase, response);
    const lines = linesTransformer.transform(payload, response);

    return {
      ...shipping,
      lines,
    };
  }
}
