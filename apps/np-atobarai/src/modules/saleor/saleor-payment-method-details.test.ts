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

    it("should return consistent payment method details across multiple calls", () => {
      const paymentMethodDetails = new SaleorPaymentMethodDetails();

      const result1 = paymentMethodDetails.toSaleorWebhookResponse();
      const result2 = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result1).toStrictEqual(result2);
    });

    it("should return payment method details with correct type", () => {
      const paymentMethodDetails = new SaleorPaymentMethodDetails();

      const result = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result).not.toBeNull();
      expect(result?.type).toBe("OTHER");
    });

    it("should return payment method details with correct name", () => {
      const paymentMethodDetails = new SaleorPaymentMethodDetails();

      const result = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result).not.toBeNull();
      expect(result?.name).toBe("np_atobarai");
    });
  });
});
