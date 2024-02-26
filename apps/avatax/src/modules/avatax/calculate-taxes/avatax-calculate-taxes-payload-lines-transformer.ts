import { LineItemModel } from "avatax/lib/models/LineItemModel";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";
import { avataxShippingLine } from "./avatax-shipping-line";

type TaxBaseLine = TaxBaseFragment["lines"][0];

const getUndiscountedTotalPrice = (line: TaxBaseLine) => {
  if (line.sourceLine.__typename === "CheckoutLine") {
    return line.sourceLine.undiscountedTotalPrice.amount;
  }

  return line.sourceLine.undiscountedTotalPrice.net.amount;
};

const checkIfIsDiscountedLine = (isDiscounted: boolean, line: TaxBaseLine) => {
  if (isDiscounted) {
    const undiscountedTotalPrice = getUndiscountedTotalPrice(line);
    const totalPrice = line.totalPrice.amount;

    return totalPrice !== undiscountedTotalPrice;
  }

  return false;
};

export class AvataxCalculateTaxesPayloadLinesTransformer {
  transform(
    taxBase: TaxBaseFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
  ): LineItemModel[] {
    /*
     * // TODO: we should revisit how discounts are distributed and flagged. I see that we can outsource distributing the discounts to AvaTax, which is something we currently do on our side.
     * https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/
     */
    const isDiscounted = taxBase.discounts.length > 0;
    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      const matcher = new AvataxCalculateTaxesTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return {
        amount: taxBase.pricesEnteredWithTax
          ? line.totalPrice.amount
          : getUndiscountedTotalPrice(line),
        taxIncluded: taxBase.pricesEnteredWithTax,
        taxCode,
        quantity: line.quantity,
        discounted: checkIfIsDiscountedLine(isDiscounted, line),
      };
    });

    if (taxBase.shippingPrice.amount !== 0) {
      const shippingLine = avataxShippingLine.create({
        amount: taxBase.shippingPrice.amount,
        taxCode: config.shippingTaxCode,
        taxIncluded: taxBase.pricesEnteredWithTax,
        discounted: isDiscounted,
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
