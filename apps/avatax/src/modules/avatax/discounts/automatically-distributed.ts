import { SaleorCalculateTaxesEvent } from "@/modules/saleor/calculate-taxes";

/*
 * Used for checkout and order calculate taxes.
 * Saleor gives us a list of discounts that are applied to the whole checkout or order. We send these to AvaTax where they will be distributed based on `discounted` flag on line level.
 * Note: Discounts on line from Saleor has discount already included in totalPrice.
 * Docs: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/
 */
export class AutomaticallyDistributedDiscountsStrategy {
  getDiscountAmount(calculateTaxesEvent: SaleorCalculateTaxesEvent) {
    return calculateTaxesEvent.getDiscountAmount();
  }

  areLinesDiscounted(calculateTaxesEvent: SaleorCalculateTaxesEvent) {
    return calculateTaxesEvent.getIsDiscounted();
  }
}
