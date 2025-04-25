import { describe, expect, it } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { PaymentIntentSucceededHandler } from "@/app/api/stripe/webhook/stripe-event-handlers/payment-intent-succeeded-handler";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";

describe("PaymentIntentSucceededHandler", () => {
  describe("Authorization Flow", () => {
    it("Resolved fields from Stripe properly", async () => {
      const event = getMockedPaymentIntentSucceededEvent();

      event.data.object.amount_capturable = 123_30;

      const transaction = getMockedRecordedTransaction({
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
      });

      const result = await new PaymentIntentSucceededHandler().processEvent({
        event,
        recordedTransaction: transaction,
      });

      const variables = result._unsafeUnwrap().resolveEventReportVariables();

      expect(variables.type).toBe("AUTHORIZATION_SUCCESS");
      // comes from mock
      expect(variables.amount.currency).toStrictEqual("USD");
      // Converted to Saleor float
      expect(variables.amount.amount).toStrictEqual(123.3);
      expect(variables.pspReference).toStrictEqual(event.data.object.id);
      expect(variables.time).toStrictEqual("2025-02-01T00:00:00.000Z");
    });
  });

  describe("Charge Flow", () => {
    it("Resolved fields from Stripe properly", async () => {
      const event = getMockedPaymentIntentSucceededEvent();

      event.data.object.amount_received = 2137_11;

      const transaction = getMockedRecordedTransaction({
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
      });

      const result = await new PaymentIntentSucceededHandler().processEvent({
        event,
        recordedTransaction: transaction,
      });

      const variables = result._unsafeUnwrap().resolveEventReportVariables();

      expect(variables.type).toBe("CHARGE_SUCCESS");
      // comes from mock
      expect(variables.amount.currency).toStrictEqual("USD");
      // Converted to Saleor float
      expect(variables.amount.amount).toStrictEqual(2137.11);
      expect(variables.pspReference).toStrictEqual(event.data.object.id);
      expect(variables.time).toStrictEqual("2025-02-01T00:00:00.000Z");
    });
  });
});
