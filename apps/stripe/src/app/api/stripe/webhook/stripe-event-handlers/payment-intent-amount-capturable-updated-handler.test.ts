import { describe, expect, it } from "vitest";

import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { getMockedPaymentIntentAmountCapturableUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-amount-capturable-updated";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";

import { PaymentIntentAmountCapturableUpdatedHandler } from "./payment-intent-amount-capturable-updated-handler";

describe("PaymentIntentAmountCapturableUpdatedHandler", () => {
  it("should resolve fields from Stripe properly", async () => {
    const event = getMockedPaymentIntentAmountCapturableUpdatedEvent();

    event.data.object.amount_capturable = 2137_11;

    const transaction = getMockedRecordedTransaction({
      resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
    });

    const result = await new PaymentIntentAmountCapturableUpdatedHandler().processEvent({
      event,
      stripePaymentIntentId: mockedStripePaymentIntentId,
      recordedTransaction: transaction,
    });

    const variables = result._unsafeUnwrap().resolveEventReportVariables();

    expect(variables.type).toBe("AUTHORIZATION_SUCCESS");
    // comes from mock
    expect(variables.amount.currency).toStrictEqual("USD");
    // Converted to Saleor float
    expect(variables.amount.amount).toStrictEqual(2137.11);
    expect(variables.pspReference).toStrictEqual(event.data.object.id);
    expect(variables.time).toStrictEqual("2025-02-01T00:00:00.000Z");
  });

  it("returns error when payment intent status is not 'requires_capture'", async () => {
    const event = getMockedPaymentIntentAmountCapturableUpdatedEvent();

    event.data.object.status = "requires_payment_method";

    const transaction = getMockedRecordedTransaction({
      resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
    });

    const result = await new PaymentIntentAmountCapturableUpdatedHandler().processEvent({
      event,
      stripePaymentIntentId: mockedStripePaymentIntentId,
      recordedTransaction: transaction,
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(
      PaymentIntentAmountCapturableUpdatedHandler.NotSupportedStatusError,
    );
  });
});
