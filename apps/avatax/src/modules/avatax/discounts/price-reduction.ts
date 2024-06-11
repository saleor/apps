/*
 * Used for order confirmed tax calculation. We don't calculate discounts here but we send totalPrices from Saleor with or without discounts and let AvaTax calculate the tax.
 * Docs: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/
 */
export class PriceReductionDiscountsStrategy {
  getDiscountAmount() {
    return undefined;
  }
  areLinesDiscounted() {
    return undefined;
  }
}
