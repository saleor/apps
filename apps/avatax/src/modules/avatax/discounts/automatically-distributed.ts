import Decimal from "decimal.js-light";

import { TaxDiscountFragment } from "../../../../graphql/fragments/TaxDiscountFragment";

/*
 * Used for checkout and order calculate taxes.
 * Saleor gives us a list of discounts that are applied to the whole checkout or order. We send these to AvaTax where they will be distributed based on `discounted` flag on line level.
 * Note: Discounts on line from Saleor has discount already included in totalPrice.
 * Docs: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/
 */
export class AutomaticallyDistributedProductLinesDiscountsStrategy {
  getDiscountAmount(taxBaseDiscounts: TaxDiscountFragment[] | undefined) {
    if (!taxBaseDiscounts) {
      return 0;
    }

    return taxBaseDiscounts
      .filter((d) => d.type === "SUBTOTAL")
      .map((discount) => discount.amount.amount)
      .reduce((total, current) => {
        return new Decimal(total).add(current).toNumber();
      }, 0);
  }

  areLinesDiscounted(taxBaseDiscounts: TaxDiscountFragment[]) {
    return this.getDiscountAmount(taxBaseDiscounts) > 0;
  }
}
