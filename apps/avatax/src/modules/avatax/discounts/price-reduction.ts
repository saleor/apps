import { SaleorOrderConfirmedEvent } from "@/modules/saleor";

/*
 * Used for order confirmed tax calculation. We don't calculate discounts here but we send totalPrices from Saleor with or without discounts and let AvaTax calculate the tax.
 * Docs: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/
 */
export class PriceReductionDiscountsStrategy {
  getDiscountAmount(_confirmedOrderEvent: SaleorOrderConfirmedEvent) {
    // non used variable is by desing - we want to indicate that we don't calculate discounts
    return undefined;
  }
  areLinesDiscounted(_confirmedOrderEvent: SaleorOrderConfirmedEvent) {
    // non used variable is by desing - we want to indicate that we don't calculate discounts
    return undefined;
  }
}
