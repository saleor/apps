import { discountUtils } from "../../taxes/discount-utils";
import { TaxJarTaxCodeMatches } from "../tax-code/taxjar-tax-code-match-repository";
import {
  TaxJarCalculateTaxesPayload,
  TaxJarCalculateTaxesTarget,
} from "./taxjar-calculate-taxes-adapter";
import { TaxJarCalculateTaxesTaxCodeMatcher } from "./taxjar-calculate-taxes-tax-code-matcher";

export class TaxJarCalculateTaxesPayloadLinesTransformer {
  transform(
    taxBase: TaxJarCalculateTaxesPayload["taxBase"],
    matches: TaxJarTaxCodeMatches,
  ): TaxJarCalculateTaxesTarget["params"]["line_items"] {
    const { lines, discounts } = taxBase;
    const discountSum = discounts?.reduce(
      (total, current) => total + Number(current.amount.amount),
      0,
    );
    const linePrices = lines.map((line) => Number(line.totalPrice.amount));
    const distributedDiscounts = discountUtils.distributeDiscount(discountSum, linePrices);

    const mappedLines: TaxJarCalculateTaxesTarget["params"]["line_items"] = lines.map(
      (line, index) => {
        const matcher = new TaxJarCalculateTaxesTaxCodeMatcher();
        const taxCode = matcher.match(line, matches);
        const discountAmount = distributedDiscounts[index];

        return {
          id: line.sourceLine.id,
          product_tax_code: taxCode,
          quantity: line.quantity,
          unit_price: Number(line.unitPrice.amount),
          discount: discountAmount,
        };
      },
    );

    return mappedLines;
  }
}
