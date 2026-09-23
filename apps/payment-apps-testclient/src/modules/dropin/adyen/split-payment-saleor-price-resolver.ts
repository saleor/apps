import type { AdyenPrice, SaleorPrice } from "./price";

/**
 * This acts as a local cache for the price that is set by the Adyen payment gateway e.g when paying with split payment. Then it is used to send proper price to Saleor (e.g gift card) instead of full checkout price.
 *
 */
export class SplitPaymentSaleorPriceResolver {
  private adyenSplitPaymentPrice: AdyenPrice | null = null;

  setAdyenSplitPaymentPrice(price: AdyenPrice) {
    this.adyenSplitPaymentPrice = price;
  }

  resetAdyenSplitPaymentPrice() {
    this.adyenSplitPaymentPrice = null;
  }

  resolveToSaleorPrice(): SaleorPrice | null {
    return this.adyenSplitPaymentPrice ? this.adyenSplitPaymentPrice.toSaleorPrice() : null;
  }
}
