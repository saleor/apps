import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripeRefundId } from "@/__tests__/mocks/mocked-stripe-refund-id";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedChargeRefundUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-charge-refund-updated";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";

import { StripeRefundHandler } from "./stripe-refund-handler";

describe("StripeRefundHandler", () => {
  describe("processRefundEvent", () => {
    it("should return NotSupportedEventError for unsupported event", async () => {
      const mockTransactionRecorder = new MockedTransactionRecorder();
      const event = {
        type: "refund.created",
      } as unknown as Stripe.Event;

      const handler = new StripeRefundHandler();

      const result = await handler.processRefundEvent({
        event,
        stripeEnv: "LIVE",
        transactionRecorder: mockTransactionRecorder,
        appId: "appId",
        saleorApiUrl: mockedSaleorApiUrl,
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRefundHandler.NotSupportedEventError);
    });

    describe("charge.refund.updated", () => {
      it.each([
        createResolvedTransactionFlow("AUTHORIZATION"),
        createResolvedTransactionFlow("CHARGE"),
      ])(
        "should resolve fields from Stripe event properly for '%s' flow",
        async (resolvedTransactionFlow) => {
          const event = getMockedChargeRefundUpdatedEvent();
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const handler = new StripeRefundHandler();

          const result = await handler.processRefundEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe("REFUND_SUCCESS");
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );

      it("should return MalformedEventError if event does not contain payment_intent", async () => {
        const event = {
          ...getMockedChargeRefundUpdatedEvent(),
          data: {
            object: {
              payment_intent: null,
            },
          },
        } as unknown as Stripe.ChargeRefundUpdatedEvent;

        const mockTransactionRecorder = new MockedTransactionRecorder();

        mockTransactionRecorder.transactions = {
          [mockedStripePaymentIntentId]: getMockedRecordedTransaction(),
        };

        const handler = new StripeRefundHandler();

        const result = await handler.processRefundEvent({
          event,
          transactionRecorder: mockTransactionRecorder,
          appId: "appId",
          saleorApiUrl: mockedSaleorApiUrl,
          stripeEnv: "LIVE",
        });

        expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeRefundHandler.MalformedEventError);
      });

      it("should resolve payment_intent from object", async () => {
        const event = {
          ...getMockedChargeRefundUpdatedEvent(),
          data: {
            object: {
              ...getMockedChargeRefundUpdatedEvent().data.object,
              payment_intent: {
                id: mockedStripePaymentIntentId.toString(),
              },
            },
          },
        } as unknown as Stripe.ChargeRefundUpdatedEvent;

        const mockTransactionRecorder = new MockedTransactionRecorder();

        mockTransactionRecorder.transactions = {
          [mockedStripePaymentIntentId]: getMockedRecordedTransaction(),
        };

        const handler = new StripeRefundHandler();

        const result = await handler.processRefundEvent({
          event,
          transactionRecorder: mockTransactionRecorder,
          appId: "appId",
          saleorApiUrl: mockedSaleorApiUrl,
          stripeEnv: "LIVE",
        });

        const { pspReference } = result._unsafeUnwrap().resolveEventReportVariables();

        expect(pspReference).toStrictEqual(mockedStripeRefundId);
      });
    });
  });
});
