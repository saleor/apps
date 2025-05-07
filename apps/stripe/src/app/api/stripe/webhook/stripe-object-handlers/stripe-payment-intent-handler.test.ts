import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { getMockedPaymentIntentAmountCapturableUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-amount-capturable-updated";
import { getMockedPaymentIntentPaymentCanceledEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-canceled";
import { getMockedPaymentIntentPaymentFailedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-failed";
import { getMockedPaymentIntentProcessingEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-processing";
import { getMockedPaymentIntentRequiresActionEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-requires-action";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";

import { StripePaymentIntentHandler } from "./stripe-payment-intent-handler";

describe("StripePaymentIntentHandler", () => {
  describe("checkIfEventIsSupported", () => {
    it.each([
      {
        event: getMockedPaymentIntentSucceededEvent(),
      },
      {
        event: getMockedPaymentIntentProcessingEvent(),
      },
      {
        event: getMockedPaymentIntentRequiresActionEvent(),
      },
      {
        event: getMockedPaymentIntentAmountCapturableUpdatedEvent(),
      },
      {
        event: getMockedPaymentIntentPaymentFailedEvent(),
      },
      {
        event: getMockedPaymentIntentPaymentCanceledEvent(),
      },
    ])("should return true for supported event: $event.type", ({ event }) => {
      const result = new StripePaymentIntentHandler().checkIfEventIsSupported(event);

      expect(result).toBe(true);
    });

    it("should return false for unsupported event", () => {
      const event = {
        type: "payment_intent.created",
      } as unknown as Stripe.Event;

      const result = new StripePaymentIntentHandler().checkIfEventIsSupported(event);

      expect(result).toBe(false);
    });
  });

  describe("processPaymentIntentEvent", () => {
    describe("type: payment_intent.succeeded", () => {
      it.each([
        createResolvedTransactionFlow("AUTHORIZATION"),
        createResolvedTransactionFlow("CHARGE"),
      ])(
        "should resolve fields with type: 'CHARGE' from Stripe event properly for '%s' flow",
        (resolvedTransactionFlow) => {
          const event = getMockedPaymentIntentSucceededEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount_received = amountToUse;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripePaymentIntentHandler().processPaymentIntentEvent({
            event,
            recordedTransaction,
            stripePaymentIntentId: mockedStripePaymentIntentId,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe("CHARGE_SUCCESS");
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });

    describe("type: payment_intent.processing", () => {
      it.each([
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
          expectedType: "AUTHORIZATION_REQUEST",
        },
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          expectedType: "CHARGE_REQUEST",
        },
      ])(
        "should resolve fields with type: $expectedType from Stripe event properly for $resolvedTransactionFlow flow",
        ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentProcessingEvent();

          event.data.object.amount_received = 123_30;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripePaymentIntentHandler().processPaymentIntentEvent({
            event,
            recordedTransaction,
            stripePaymentIntentId: mockedStripePaymentIntentId,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          // Converted to Saleor float
          expect(amount.amount).toStrictEqual(123.3);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });

    describe("type: payment_intent.requires_action", () => {
      it.each([
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
          expectedType: "AUTHORIZATION_ACTION_REQUIRED",
        },
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          expectedType: "CHARGE_ACTION_REQUIRED",
        },
      ])(
        "should resolve fields with type: $expectedType from Stripe event properly for $resolvedTransactionFlow flow",
        ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentRequiresActionEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount_received = amountToUse;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripePaymentIntentHandler().processPaymentIntentEvent({
            event,
            recordedTransaction,
            stripePaymentIntentId: mockedStripePaymentIntentId,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });

    describe("type: payment_intent.amount_capturable_updated", () => {
      it.each([
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
          expectedType: "AUTHORIZATION_SUCCESS",
        },
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          expectedType: "AUTHORIZATION_SUCCESS",
        },
      ])(
        "should resolve fields with type: $expectedType from Stripe event properly for $resolvedTransactionFlow flow",
        ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentAmountCapturableUpdatedEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount_capturable = amountToUse;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripePaymentIntentHandler().processPaymentIntentEvent({
            event,
            recordedTransaction,
            stripePaymentIntentId: mockedStripePaymentIntentId,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });

    describe("type: payment_intent.payment_failed", () => {
      it.each([
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
          expectedType: "AUTHORIZATION_FAILURE",
        },
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          expectedType: "CHARGE_FAILURE",
        },
      ])(
        "should resolve fields with type: $expectedType from Stripe event properly for $resolvedTransactionFlow flow",
        ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentPaymentFailedEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount_received = amountToUse;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripePaymentIntentHandler().processPaymentIntentEvent({
            event,
            recordedTransaction,
            stripePaymentIntentId: mockedStripePaymentIntentId,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });

    describe("type: payment_intent.canceled", () => {
      it.each([
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
          expectedType: "CANCEL_SUCCESS",
        },
        {
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          expectedType: "CANCEL_SUCCESS",
        },
      ])(
        "should resolve fields with type: $expectedType from Stripe event properly for $resolvedTransactionFlow flow",
        ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentPaymentCanceledEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const recordedTransaction = getMockedRecordedTransaction({
            resolvedTransactionFlow,
          });

          const result = new StripePaymentIntentHandler().processPaymentIntentEvent({
            event,
            recordedTransaction,
            stripePaymentIntentId: mockedStripePaymentIntentId,
            stripeEnv: "LIVE",
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("USD");
          expect(amount.amount).toStrictEqual(amountExpected);
          expect(pspReference).toStrictEqual(event.data.object.id);
          expect(time).toStrictEqual("2025-02-01T00:00:00.000Z");
        },
      );
    });
  });
});
