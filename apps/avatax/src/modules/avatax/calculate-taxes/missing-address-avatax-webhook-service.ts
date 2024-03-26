import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { CalculateTaxesPayload } from "../../webhooks/payloads/calculate-taxes-payload";

export class MissingAddressAvataxWebhookService {
  public static calculateTaxesNoop(payload: CalculateTaxesPayload): CalculateTaxesResponse {
    /*
     * If there is missing address in the payload, we won't be able to calculate taxes but we can return totalPrice
     * and shippingPrice from the payload as a fallback so users will see the correct prices in the cart instead of 0.
     */

    return {
      shipping_price_gross_amount: payload.taxBase.shippingPrice.amount,
      shipping_price_net_amount: payload.taxBase.shippingPrice.amount,
      shipping_tax_rate: 0,
      lines: payload.taxBase.lines.map((line) => ({
        total_gross_amount: line.totalPrice.amount,
        total_net_amount: line.totalPrice.amount,
        tax_rate: 0,
      })),
    };
  }
}
