import * as Sentry from "@sentry/nextjs";
import { LineItemModel } from "avatax/lib/models/LineItemModel";
import Decimal from "decimal.js-light";

import { TaxBaseFragment } from "../../../../generated/graphql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AutomaticallyDistributedProductLinesDiscountsStrategy } from "../discounts";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { AvataxCalculateTaxesTaxCodeMatcher } from "./avatax-calculate-taxes-tax-code-matcher";
import { avataxProductLine } from "./avatax-product-line";
import { avataxShippingLine } from "./avatax-shipping-line";

export class AvataxCalculateTaxesPayloadLinesTransformer {
  constructor(private avataxCalculateTaxesTaxCodeMatcher: AvataxCalculateTaxesTaxCodeMatcher) {}

  private calculateShippingDiscount(discounts: TaxBaseFragment["discounts"]) {
    /**
     * For shipping we sum all the shipping-type discounts and subtract them from shipping price
     */
    return discounts
      .filter((d) => d.type === "SHIPPING")
      .reduce((sum, discount) => {
        return new Decimal(sum).add(new Decimal(discount.amount.amount));
      }, new Decimal(0));
  }

  /**
   * Method name is temporary -> replace with "transofrm" later
   * This method is including extra fields that will be added in SHOPX-1145
   */
  transformWithDiscountType(
    taxBase: TaxBaseFragment,
    config: AvataxConfig,
    matches: AvataxTaxCodeMatches,
    discountsStrategy: AutomaticallyDistributedProductLinesDiscountsStrategy,
  ) {
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
      const shippingAmountMinusDiscounts = new Decimal(taxBase.shippingPrice.amount)
        .sub(new Decimal(this.calculateShippingDiscount(taxBase.discounts)))
        .toNumber();

      if (shippingAmountMinusDiscounts < 0) {
        Sentry.captureException(
          new Error("Saleor returned shipping discounts with higher values than shipping amount"),
        );
      }

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
