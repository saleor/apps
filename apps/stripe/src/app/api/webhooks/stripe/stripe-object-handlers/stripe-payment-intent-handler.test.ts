import { SaleorSchemaVersion } from "@saleor/app-sdk/types";
import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import {
  mockedStripeCardPaymentMethod,
  mockedStripeOtherPaymentMethod,
} from "@/__tests__/mocks/mocked-stripe-payment-method";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedPaymentIntentAmountCapturableUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-amount-capturable-updated";
import { getMockedPaymentIntentPaymentCanceledEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-canceled";
import { getMockedPaymentIntentPaymentFailedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-failed";
import { getMockedPaymentIntentProcessingEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-processing";
import { getMockedPaymentIntentRequiresActionEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-requires-action";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { SaleorPaymentMethodDetails } from "@/modules/saleor/saleor-payment-method-details";

import { StripePaymentIntentHandler } from "./stripe-payment-intent-handler";

describe("StripePaymentIntentHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for getPaymentIntent used in getPaymentMethodDetails
    vi.mocked(mockedStripePaymentIntentsApi.getPaymentIntent).mockResolvedValue(
      ok({
        id: mockedStripePaymentIntentId,
        payment_method: mockedStripeCardPaymentMethod,
      } as Stripe.PaymentIntent),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return NotSupportedEventError for unsupported event", async () => {
    const mockTransactionRecorder = new MockedTransactionRecorder();
    const event = {
      type: "payment_intent.created",
    } as unknown as Stripe.Event;

    const handler = new StripePaymentIntentHandler();

    const result = await handler.processPaymentIntentEvent({
      event,
      stripeEnv: "LIVE",
      transactionRecorder: mockTransactionRecorder,
      appId: "appId",
      saleorApiUrl: mockedSaleorApiUrl,
      stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      StripePaymentIntentHandler.NotSupportedEventError,
    );
  });

  describe("processPaymentIntentEvent", () => {
    describe("type: payment_intent.succeeded", () => {
      it.each([
        createResolvedTransactionFlow("AUTHORIZATION"),
        createResolvedTransactionFlow("CHARGE"),
      ])(
        "should resolve fields with type: 'CHARGE' from Stripe event properly for '%s' flow",
        async (resolvedTransactionFlow) => {
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const event = getMockedPaymentIntentSucceededEvent();
          const amountToUse = 123_312;
          const amountExpected = 123.312; // Converted to Saleor float

          event.data.object.amount_received = amountToUse;

          const handler = new StripePaymentIntentHandler();
          const result = await handler.processPaymentIntentEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
            stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe("CHARGE_SUCCESS");
          // comes from mock
          expect(amount.currency).toStrictEqual("IQD");
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
        async ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentProcessingEvent();
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const amountToUse = 123_30;
          const amountExpected = 12330; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const handler = new StripePaymentIntentHandler();
          const result = await handler.processPaymentIntentEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
            stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("JPY");
          // Converted to Saleor float
          expect(amount.amount).toStrictEqual(amountExpected);
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
        async ({ resolvedTransactionFlow, expectedType }) => {
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const event = getMockedPaymentIntentRequiresActionEvent();
          const amountToUse = 123_367;
          const amountExpected = 12.3367; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const handler = new StripePaymentIntentHandler();

          const result = await handler.processPaymentIntentEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
            stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
          });

          const { type, amount, pspReference, time } = result
            ._unsafeUnwrap()
            .resolveEventReportVariables();

          expect(type).toBe(expectedType);
          // comes from mock
          expect(amount.currency).toStrictEqual("UYW");
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
        async ({ resolvedTransactionFlow, expectedType }) => {
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const event = getMockedPaymentIntentAmountCapturableUpdatedEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount_capturable = amountToUse;

          const handler = new StripePaymentIntentHandler();
          const result = await handler.processPaymentIntentEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
            stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
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
        async ({ resolvedTransactionFlow, expectedType }) => {
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const event = getMockedPaymentIntentPaymentFailedEvent();
          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const handler = new StripePaymentIntentHandler();
          const result = await handler.processPaymentIntentEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
            stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
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
        async ({ resolvedTransactionFlow, expectedType }) => {
          const event = getMockedPaymentIntentPaymentCanceledEvent();
          const mockTransactionRecorder = new MockedTransactionRecorder();

          mockTransactionRecorder.transactions = {
            [mockedStripePaymentIntentId]: getMockedRecordedTransaction({
              resolvedTransactionFlow,
            }),
          };

          const amountToUse = 123_30;
          const amountExpected = 123.3; // Converted to Saleor float

          event.data.object.amount = amountToUse;

          const handler = new StripePaymentIntentHandler();
          const result = await handler.processPaymentIntentEvent({
            event,
            transactionRecorder: mockTransactionRecorder,
            appId: "appId",
            saleorApiUrl: mockedSaleorApiUrl,
            stripeEnv: "LIVE",
            stripePaymentIntentsApi: mockedStripePaymentIntentsApi,
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

  describe("getPaymentMethodDetails", () => {
    describe("when Saleor version is compatible (>= 3.22)", () => {
      const compatibleVersion: SaleorSchemaVersion = [3, 22];

      it("returns SaleorPaymentMethodDetails when payment intent has card payment method", async () => {
        const mockPaymentIntent: Stripe.PaymentIntent = {
          id: mockedStripePaymentIntentId,
          payment_method: mockedStripeCardPaymentMethod,
        } as Stripe.PaymentIntent;

        vi.mocked(mockedStripePaymentIntentsApi.getPaymentIntent).mockResolvedValue(
          ok(mockPaymentIntent),
        );

        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          compatibleVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).toHaveBeenCalledWith({
          id: mockedStripePaymentIntentId,
        });
        expect(result).toBeInstanceOf(SaleorPaymentMethodDetails);
      });

      it("returns SaleorPaymentMethodDetails when payment intent has other payment method", async () => {
        const mockPaymentIntent: Stripe.PaymentIntent = {
          id: mockedStripePaymentIntentId,
          payment_method: mockedStripeOtherPaymentMethod,
        } as Stripe.PaymentIntent;

        vi.mocked(mockedStripePaymentIntentsApi.getPaymentIntent).mockResolvedValue(
          ok(mockPaymentIntent),
        );

        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          compatibleVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).toHaveBeenCalledWith({
          id: mockedStripePaymentIntentId,
        });
        expect(result).toBeInstanceOf(SaleorPaymentMethodDetails);
      });

      it("returns null when API call fails to fetch payment intent", async () => {
        vi.mocked(mockedStripePaymentIntentsApi.getPaymentIntent).mockResolvedValue(
          err(new Error("API error")),
        );

        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          compatibleVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).toHaveBeenCalledWith({
          id: mockedStripePaymentIntentId,
        });
        expect(result).toBeNull();
      });

      it("returns null when payment method is null", async () => {
        const mockPaymentIntent: Stripe.PaymentIntent = {
          id: mockedStripePaymentIntentId,
          payment_method: null,
        } as Stripe.PaymentIntent;

        vi.mocked(mockedStripePaymentIntentsApi.getPaymentIntent).mockResolvedValue(
          ok(mockPaymentIntent),
        );

        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          compatibleVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).toHaveBeenCalledWith({
          id: mockedStripePaymentIntentId,
        });
        expect(result).toBeNull();
      });

      it("returns null when payment method is a string (not expanded)", async () => {
        const mockPaymentIntent: Stripe.PaymentIntent = {
          id: mockedStripePaymentIntentId,
          payment_method: "pm_123456789",
        } as Stripe.PaymentIntent;

        vi.mocked(mockedStripePaymentIntentsApi.getPaymentIntent).mockResolvedValue(
          ok(mockPaymentIntent),
        );

        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          compatibleVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).toHaveBeenCalledWith({
          id: mockedStripePaymentIntentId,
        });
        expect(result).toBeNull();
      });
    });

    describe("when Saleor version is incompatible (< 3.22)", () => {
      const incompatibleVersion: SaleorSchemaVersion = [3, 21];

      it("returns null without calling API", async () => {
        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          incompatibleVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });

      it("returns null for version 3.20", async () => {
        const olderVersion: SaleorSchemaVersion = [3, 20];

        const handler = new StripePaymentIntentHandler();
        const result = await handler["getPaymentMethodDetails"](
          olderVersion,
          mockedStripePaymentIntentsApi,
          mockedStripePaymentIntentId,
        );

        expect(mockedStripePaymentIntentsApi.getPaymentIntent).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });
    });
  });
});
