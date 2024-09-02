import { LineItemModel } from "avatax/lib/models/LineItemModel";

import { TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AutomaticallyDistributedDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";
import { avataxProductLine } from "./avatax-product-line";
import { avataxShippingLine } from "./avatax-shipping-line";

export class AvataxCalculateTaxesPayloadLinesTransformer {
  /**
   * @deprecated use transformWithDiscountType when new fields available
   */
  transform(
    taxBase: TaxBaseFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
    discountsStrategy: AutomaticallyDistributedDiscountsStrategy,
  ): LineItemModel[] {
    const areLinesDiscounted = discountsStrategy.areLinesDiscounted(taxBase.discounts);

    // Price reduction discounts - we send totalPrices with or without discounts and let AvaTax calculate the tax
    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      const matcher = new AvataxCalculateTaxesTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

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

  private calculateShippingDiscount(
    discounts: Array<TaxBaseFragment["discounts"][0] & { type: "SUBTOTAL" | "SHIPPING" }>,
  ) {
    /**
     * For shipping we sum all the shipping-type discounts and subtract them from shipping price
     */
    return discounts
      .filter((d) => d.type === "SHIPPING")
      .reduce((sum, discount) => {
        return sum + discount.amount.amount;
      }, 0);
  }

  /**
   * Method name is temporary -> replace with "transofrm" later
   * This method is including extra fields that will be added in SHOPX-1145
   */
  transformWithDiscountType(
    taxBase: TaxBaseFragment & {
      /**
       * TODO: Replace with auto-generated value once available
       */
      discounts: Array<TaxBaseFragment["discounts"][0] & { type: "SUBTOTAL" | "SHIPPING" }>;
    },
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
    discountsStrategy: AutomaticallyDistributedDiscountsStrategy,
  ) {
    const areLinesDiscounted = discountsStrategy.areLinesDiscounted(taxBase.discounts);

    // Price reduction discounts - we send totalPrices with or without discounts and let AvaTax calculate the tax
    const productLines: LineItemModel[] = taxBase.lines.map((line) => {
      const matcher = new AvataxCalculateTaxesTaxCodeMatcher();
      const taxCode = matcher.match(line, matches);

      return avataxProductLine.create({
        amount: line.totalPrice.amount,
        taxIncluded: taxBase.pricesEnteredWithTax,
        taxCode,
        quantity: line.quantity,
        discounted: areLinesDiscounted,
      });
    });

    if (taxBase.shippingPrice.amount !== 0) {
      const shippingAmountMinusDiscounts =
        taxBase.shippingPrice.amount - this.calculateShippingDiscount(taxBase.discounts);

      const shippingLine = avataxShippingLine.create({
        /**
         * Do not allow shipping price lower than 0, in case of discounts are
         */
        amount: shippingAmountMinusDiscounts >= 0 ? shippingAmountMinusDiscounts : 0,
        taxCode: config.shippingTaxCode,
        taxIncluded: taxBase.pricesEnteredWithTax,
        /**
         * We are reducing an amount of shipping, so we no longer mark it as discounted (discount is calculated in the amount - price reduction discount strategy)
         */
        discounted: false,
      });

      return [...productLines, shippingLine];
    }

    return productLines;
  }
}
