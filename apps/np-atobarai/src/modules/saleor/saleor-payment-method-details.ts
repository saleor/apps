import { Paymentmethoddetails } from "@/generated/app-webhooks-types/transaction-process-session";

/**
 * Provides payment method details for Saleor webhook responses.
 * As this is a single provider payment gateway, NP Atobarai details are hardcoded.
 */
export class SaleorPaymentMethodDetails {
  /**
   * Converts to Saleor webhook response format.
   * Returns hardcoded NP Atobarai payment method details.
   *
   * @returns Payment method details with type "OTHER" and name "np_atobarai"
   */
  toSaleorWebhookResponse(): Paymentmethoddetails {
    return {
      type: "OTHER",
      name: "np_atobarai",
    };
  }
}
