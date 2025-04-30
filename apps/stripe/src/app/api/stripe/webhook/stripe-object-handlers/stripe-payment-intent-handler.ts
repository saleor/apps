import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatusValidationError,
} from "@/modules/stripe/stripe-payment-intent-status";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { mapPaymentIntentStatusToTransactionResult } from "@/modules/transaction-result/map-payment-intent-status-to-transaction-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { TransactionEventReportVariablesResolver } from "../transaction-event-report-variables-resolver";

export type SupportedEvents =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PaymentIntentProcessingEvent
  | Stripe.PaymentIntentRequiresActionEvent
  | Stripe.PaymentIntentAmountCapturableUpdatedEvent
  | Stripe.PaymentIntentPaymentFailedEvent;

type PossibleErrors = InstanceType<
  typeof SaleorMoney.ValidationError | typeof StripePaymentIntentStatusValidationError
>;

export class StripePaymentIntentHandler {
  private prepareTransactionEventReportParams(event: SupportedEvents) {
    const intentObject = event.data.object;
    const currency = intentObject.currency;
    const amountCapturable = intentObject.amount_capturable;
    const amountReceived = intentObject.amount_received;
    const eventDate = createDateFromStripeEvent(event);

    const paramsResult = Result.combine([
      SaleorMoney.createFromStripe({
        amount:
          event.type === "payment_intent.amount_capturable_updated"
            ? amountCapturable
            : amountReceived,
        currency,
      }),
      createStripePaymentIntentStatus(intentObject.status),
    ]);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const [saleorMoney, paymentIntentStatus] = paramsResult.value;

    return ok({
      saleorMoney,
      paymentIntentStatus,
      eventDate,
    });
  }

  checkIfEventIsSupported(event: Stripe.Event): event is SupportedEvents {
    return (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.processing" ||
      event.type === "payment_intent.requires_action" ||
      event.type === "payment_intent.amount_capturable_updated" ||
      event.type === "payment_intent.payment_failed"
    );
  }

  processPaymentIntentEvent(args: {
    event: SupportedEvents;
    recordedTransaction: RecordedTransaction;
    stripePaymentIntentId: StripePaymentIntentId;
  }): Result<TransactionEventReportVariablesResolver, PossibleErrors> {
    const {
      event,
      recordedTransaction: { resolvedTransactionFlow, saleorTransactionId },
      stripePaymentIntentId,
    } = args;
    const paramsResult = this.prepareTransactionEventReportParams(event);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const { saleorMoney, paymentIntentStatus, eventDate } = paramsResult.value;

    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.processing":
      case "payment_intent.requires_action":
      case "payment_intent.amount_capturable_updated": {
        const MappedResult = mapPaymentIntentStatusToTransactionResult(
          paymentIntentStatus,
          resolvedTransactionFlow,
        );

        const result = new MappedResult({
          saleorMoney,
          stripePaymentIntentId: stripePaymentIntentId,
          stripeStatus: paymentIntentStatus,
        });

        return ok(
          new TransactionEventReportVariablesResolver({
            transactionResult: result,
            date: eventDate,
            saleorTransactionId: saleorTransactionId,
          }),
        );
      }

      case "payment_intent.payment_failed": {
        const failureResult =
          resolvedTransactionFlow === "AUTHORIZATION"
            ? new AuthorizationFailureResult({
                saleorMoney,
                stripePaymentIntentId: stripePaymentIntentId,
              })
            : new ChargeFailureResult({
                saleorMoney,
                stripePaymentIntentId: stripePaymentIntentId,
              });

        return ok(
          new TransactionEventReportVariablesResolver({
            transactionResult: failureResult,
            date: eventDate,
            saleorTransactionId: saleorTransactionId,
          }),
        );
      }
    }
  }
}
