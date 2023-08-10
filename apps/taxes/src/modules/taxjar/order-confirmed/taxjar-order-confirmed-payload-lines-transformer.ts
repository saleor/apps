import { LineItem } from "taxjar/dist/util/types";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarOrderConfirmedTaxCodeMatcher } from "./taxjar-order-confirmed-tax-code-matcher";

export class TaxJarOrderConfirmedPayloadLinesTransformer {
  transform(
    lines: OrderConfirmedSubscriptionFragment["lines"],
    matches: TaxJarTaxCodeMatches
  ): LineItem[] {
    return lines.map((line) => {
      const matcher = new TaxJarOrderConfirmedTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return {
        quantity: line.quantity,
        unit_price: line.unitPrice.net.amount,
        product_identifier: line.productSku ?? "",
        product_tax_code: taxCode,
        sales_tax: line.totalPrice.tax.amount,
        description: line.productName,
      };
    });
  }
}
