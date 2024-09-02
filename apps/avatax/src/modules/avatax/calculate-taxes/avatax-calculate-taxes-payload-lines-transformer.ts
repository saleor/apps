import { LineItemModel } from "avatax/lib/models/LineItemModel";

import { TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AutomaticallyDistributedDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";
import { avataxProductLine } from "./avatax-product-line";
import { avataxShippingLine } from "./avatax-shipping-line";

export class AvataxCalculateTaxesPayloadLinesTransformer {
  constructor(private avataxCalculateTaxesTaxCodeMatcher: AvataxCalculateTaxesTaxCodeMatcher) {}

  transform(
    taxBase: TaxBaseFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
    discountsStrategy: AutomaticallyDistributedDiscountsStrategy,
  ): LineItemModel[] {
    const areLinesDiscounted = discountsStrategy.areLinesDiscounted(taxBase.discounts);

    // Price reduction discounts - we send totalPrices with or without discounts and let AvaTax calculate the tax
    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      const taxCode = this.avataxCalculateTaxesTaxCodeMatcher.match(line, matches);

      return avataxProductLine.create({
        amount: line.totalPrice.amount,
        taxIncluded: taxBase.pricesEnteredWithTax,
        taxCode,
        quantity: line.quantity,
        discounted: areLinesDiscounted,
      });
    });

    if (taxBase.shippingPrice.amount !== 0) {
      const shippingLine = avataxShippingLine.create({
        amount: taxBase.shippingPrice.amount,
        taxCode: config.shippingTaxCode,
        taxIncluded: taxBase.pricesEnteredWithTax,
        discounted: areLinesDiscounted,
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
