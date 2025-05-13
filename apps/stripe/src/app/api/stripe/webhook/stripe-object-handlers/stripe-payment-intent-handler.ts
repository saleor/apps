import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { resolveSaleorMoneyFromStripePaymentIntent } from "@/modules/saleor/resolve-saleor-money-from-stripe-payment-intent";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generatePaymentIntentStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import { createTimestampFromStripeEvent } from "@/modules/stripe/stripe-timestamps";
import { CancelSuccessResult } from "@/modules/transaction-result/cancel-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import { mapPaymentIntentStatusToTransactionResult } from "@/modules/transaction-result/map-payment-intent-status-to-transaction-result";
import {
  TransactionRecorderError,
  TransactionRecorderRepo,
} from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { TransactionEventReportVariablesResolver } from "../transaction-event-report-variables-resolver";

export type StripePaymentIntentHandlerSupportedEvents =
  | Stripe.PaymentIntentSucceededEvent
  | Stripe.PaymentIntentProcessingEvent
  | Stripe.PaymentIntentRequiresActionEvent
  | Stripe.PaymentIntentAmountCapturableUpdatedEvent
  | Stripe.PaymentIntentPaymentFailedEvent
  | Stripe.PaymentIntentCanceledEvent;

type PossibleErrors =
  | InstanceType<
      | typeof SaleorMoney.ValidationError
      | typeof StripePaymentIntentHandler.NotSupportedEventError
      | typeof StripePaymentIntentHandler.MalformedEventError
    >
  | TransactionRecorderError;

export class StripePaymentIntentHandler {
  static NotSupportedEventError = BaseError.subclass("NotSupportedEventError", {
    props: {
      __internalName: "StripePaymentIntentHandler.NotSupportedEventError",
    },
  });

  static MalformedEventError = BaseError.subclass("MalformedEventError", {
    props: {
      __internalName: "StripePaymentIntentHandler.MalformedEventError",
    },
  });

  private prepareTransactionEventReportParams(event: StripePaymentIntentHandlerSupportedEvents) {
    const timestamp = createTimestampFromStripeEvent(event);

    const paymentIntentStatus = createStripePaymentIntentStatus(event.data.object.status);

    const saleorMoneyResult = resolveSaleorMoneyFromStripePaymentIntent(event.data.object);

    if (saleorMoneyResult.isErr()) {
      return err(saleorMoneyResult.error);
    }

    return ok({
      saleorMoney: saleorMoneyResult.value,
      paymentIntentStatus,
      timestamp,
    });
  }

  private checkIfEventIsSupported(
    event: Stripe.Event,
  ): event is StripePaymentIntentHandlerSupportedEvents {
    return (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.processing" ||
      event.type === "payment_intent.requires_action" ||
      event.type === "payment_intent.amount_capturable_updated" ||
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    );
  }

  private async resolveTransactionRecord({
    transactionRecorder,
    stripePaymentIntentId,
    appId,
    saleorApiUrl,
  }: {
    transactionRecorder: TransactionRecorderRepo;
    stripePaymentIntentId: StripePaymentIntentId;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }) {
    const recordedTransactionResult =
      await transactionRecorder.getTransactionByStripePaymentIntentId(
        {
          appId,
          saleorApiUrl,
        },
        stripePaymentIntentId,
      );

    if (recordedTransactionResult.isErr()) {
      return err(recordedTransactionResult.error);
    }

    return ok(recordedTransactionResult.value);
  }

  async processPaymentIntentEvent({
    event,
    stripeEnv,
    transactionRecorder,
    appId,
    saleorApiUrl,
  }: {
    event: Stripe.Event;
    stripeEnv: StripeEnv;
    transactionRecorder: TransactionRecorderRepo;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<TransactionEventReportVariablesResolver, PossibleErrors>> {
    if (!this.checkIfEventIsSupported(event)) {
      return err(new StripePaymentIntentHandler.NotSupportedEventError("Unsupported event type"));
    }

    const stripePaymentIntentId = createStripePaymentIntentId(event.data.object.id);

    const recordedTransactionResult = await this.resolveTransactionRecord({
      transactionRecorder,
      stripePaymentIntentId,
      appId,
      saleorApiUrl,
    });

    if (recordedTransactionResult.isErr()) {
      return err(recordedTransactionResult.error);
    }

    const { resolvedTransactionFlow, saleorTransactionId } = recordedTransactionResult.value;

    const paramsResult = this.prepareTransactionEventReportParams(event);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const { saleorMoney, paymentIntentStatus, timestamp } = paramsResult.value;

    const externalUrl = generatePaymentIntentStripeDashboardUrl(stripePaymentIntentId, stripeEnv);

    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.processing":
      case "payment_intent.requires_action":
      case "payment_intent.amount_capturable_updated": {
        return ok(
          new TransactionEventReportVariablesResolver({
            saleorMoney,
            transactionResult: mapPaymentIntentStatusToTransactionResult(
              paymentIntentStatus,
              resolvedTransactionFlow,
            ),
            timestamp,
            saleorTransactionId,
            stripeObjectId: stripePaymentIntentId,
            externalUrl,
          }),
        );
      }

      case "payment_intent.payment_failed": {
        const failureResult =
          resolvedTransactionFlow === "AUTHORIZATION"
            ? new AuthorizationFailureResult()
            : new ChargeFailureResult();

        return ok(
          new TransactionEventReportVariablesResolver({
            saleorMoney,
            transactionResult: failureResult,
            timestamp,
            saleorTransactionId,
            stripeObjectId: stripePaymentIntentId,
            externalUrl,
          }),
        );
      }

      case "payment_intent.canceled": {
        return ok(
          new TransactionEventReportVariablesResolver({
            transactionResult: new CancelSuccessResult(),
            saleorMoney,
            timestamp,
            saleorTransactionId,
            stripeObjectId: stripePaymentIntentId,
            externalUrl,
          }),
        );
      }
    }
  }
}
