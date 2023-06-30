import { LineItem } from "taxjar/dist/util/types";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import { TaxJarOrderCreatedTaxCodeMatcher } from "./taxjar-order-created-tax-code-matcher";

export class TaxJarOrderCreatedPayloadLinesTransformer {
  transform(
    lines: OrderCreatedSubscriptionFragment["lines"],
    matches: TaxJarTaxCodeMatches
  ): LineItem[] {
    return lines.map((line) => {
      const matcher = new TaxJarOrderCreatedTaxCodeMatcher();
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
