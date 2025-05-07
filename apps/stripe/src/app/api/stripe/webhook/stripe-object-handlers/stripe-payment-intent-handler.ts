import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatusValidationError,
} from "@/modules/stripe/stripe-payment-intent-status";
import { CancelSuccessResult } from "@/modules/transaction-result/cancel-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { mapPaymentIntentStatusToTransactionResult } from "@/modules/transaction-result/map-payment-intent-status-to-transaction-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { TransactionEventReportVariablesResolver } from "../transaction-event-report-variables-resolver";

export type StripePaymentIntentHandlerSupportedEvents =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PaymentIntentProcessingEvent
  | Stripe.PaymentIntentRequiresActionEvent
  | Stripe.PaymentIntentAmountCapturableUpdatedEvent
  | Stripe.PaymentIntentPaymentFailedEvent
  | Stripe.PaymentIntentCanceledEvent;

type PossibleErrors = InstanceType<
  typeof SaleorMoney.ValidationError | typeof StripePaymentIntentStatusValidationError
>;

export class StripePaymentIntentHandler {
  private resolveAmount(event: StripePaymentIntentHandlerSupportedEvents) {
    const amount = event.data.object.amount;
    const amountCapturable = event.data.object.amount_capturable;
    const amountReceived = event.data.object.amount_received;

    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
        return amountCapturable;
      case "payment_intent.canceled":
        return amount;
      default:
        return amountReceived;
    }
  }

  private prepareTransactionEventReportParams(event: StripePaymentIntentHandlerSupportedEvents) {
    const intentObject = event.data.object;
    const currency = intentObject.currency;
    const eventDate = createDateFromStripeEvent(event);

    const paramsResult = Result.combine([
      SaleorMoney.createFromStripe({
        amount: this.resolveAmount(event),
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

  checkIfEventIsSupported(event: Stripe.Event): event is StripePaymentIntentHandlerSupportedEvents {
    return (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.processing" ||
      event.type === "payment_intent.requires_action" ||
      event.type === "payment_intent.amount_capturable_updated" ||
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    );
  }

  processPaymentIntentEvent(args: {
    event: StripePaymentIntentHandlerSupportedEvents;
    recordedTransaction: RecordedTransaction;
    stripePaymentIntentId: StripePaymentIntentId;
    stripeEnv: StripeEnv;
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
          stripePaymentIntentId: stripePaymentIntentId,
          stripeStatus: paymentIntentStatus,
          stripeEnv: args.stripeEnv,
        });

        return ok(
          new TransactionEventReportVariablesResolver({
            saleorMoney,
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
                stripePaymentIntentId: stripePaymentIntentId,
                stripeEnv: args.stripeEnv,
              })
            : new ChargeFailureResult({
                stripePaymentIntentId: stripePaymentIntentId,
                stripeEnv: args.stripeEnv,
              });

        return ok(
          new TransactionEventReportVariablesResolver({
            saleorMoney,
            transactionResult: failureResult,
            date: eventDate,
            saleorTransactionId: saleorTransactionId,
          }),
        );
      }

      case "payment_intent.canceled": {
        return ok(
          new TransactionEventReportVariablesResolver({
            transactionResult: new CancelSuccessResult({
              stripePaymentIntentId: stripePaymentIntentId,
              stripeEnv: args.stripeEnv,
            }),
            saleorMoney,
            date: eventDate,
            saleorTransactionId: saleorTransactionId,
          }),
        );
      }
    }
  }
}
