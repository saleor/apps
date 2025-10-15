import { describe, expect, it } from "vitest";

import { SaleorPaymentMethodDetails } from "./saleor-payment-method-details";

describe("SaleorPaymentMethodDetails", () => {
  describe("toSaleorWebhookResponse", () => {
    it("should return hardcoded NP Atobarai payment method details", () => {
      const paymentMethodDetails = new SaleorPaymentMethodDetails();

      const result = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "np_atobarai",
          "type": "OTHER",
        }
      `);
    });
  });
});
