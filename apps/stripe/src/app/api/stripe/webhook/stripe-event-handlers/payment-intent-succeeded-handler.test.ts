import { describe, expect, it } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { PaymentIntentSucceededHandler } from "@/app/api/stripe/webhook/stripe-event-handlers/payment-intent-succeeded-handler";

describe("PaymentIntentSucceededHandler", () => {
  describe("Authorization Flow", () => {
    it("Resolved fields from Stripe properly", async () => {
      const event = getMockedPaymentIntentSucceededEvent();

      event.data.object.amount_capturable = 123_30;

      const transaction = getMockedRecordedTransaction({
        transactionFlow: "AUTHORIZATION",
      });

      const result = await new PaymentIntentSucceededHandler().processEvent({
        event,
        recordedTransaction: transaction,
      });

      const value = result._unsafeUnwrap().getTransactionEventReportVariables();

      expect(value.type).toBe("AUTHORIZATION_SUCCESS");
      // comes from mock
      expect(value.amount.currency).toStrictEqual("USD");
      // Converted to Saleor float
      expect(value.amount.amount).toStrictEqual(123.3);
      expect(value.pspReference).toStrictEqual(event.data.object.id);
      expect(value.time).toBeInstanceOf(Date);
    });
  });

  describe("Charge Flow", () => {
    it("Resolved fields from Stripe properly", async () => {
      const event = getMockedPaymentIntentSucceededEvent();

      event.data.object.amount_received = 2137_11;

      const transaction = getMockedRecordedTransaction({
        transactionFlow: "CHARGE",
      });

      const result = await new PaymentIntentSucceededHandler().processEvent({
        event,
        recordedTransaction: transaction,
      });

      const value = result._unsafeUnwrap().getTransactionEventReportVariables();

      expect(value.type).toBe("CHARGE_SUCCESS");
      // comes from mock
      expect(value.amount.currency).toStrictEqual("USD");
      // Converted to Saleor float
      expect(value.amount.amount).toStrictEqual(2137.11);
      expect(value.pspReference).toStrictEqual(event.data.object.id);
      expect(value.time).toBeInstanceOf(Date);
    });
  });
});
