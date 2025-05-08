import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { getMockedChargeRefundUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-charge-refund-updated";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";

import { StripeRefundHandler } from "./stripe-refund-handler";

describe("StripeRefundHandler", () => {
  describe("checkIfEventIsSupported", () => {
    it.each([
      {
        event: getMockedChargeRefundUpdatedEvent(),
      },
    ])("should return true for supported event: $event.type", ({ event }) => {
      const result = new StripeRefundHandler().checkIfEventIsSupported(event);

      expect(result).toBe(true);
    });

    it("should return false for unsupported event", () => {
      const event = {
        type: "payment_intent.created",
      } as unknown as Stripe.Event;

      const result = new StripeRefundHandler().checkIfEventIsSupported(event);

      expect(result).toBe(false);
    });
  });

  describe("processRefundEvent", () => {
    describe("charge.refund.updated", () => {
      it.each([
        createResolvedTransactionFlow("AUTHORIZATION"),
        createResolvedTransactionFlow("CHARGE"),
      ])(
        "should resolve fields from Stripe event properly for '%s' flow",
        (resolvedTransactionFlow) => {
          const event = getMockedChargeRefundUpdatedEvent();

          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripeRefundHandler().processRefundEvent({
            event,
            recordedTransaction,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe("REFUND_SUCCESS");
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.payment_intent);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });
  });
});
