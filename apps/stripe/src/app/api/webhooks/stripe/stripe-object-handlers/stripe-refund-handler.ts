import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { generateRefundStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-urls";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { createStripeRefundId } from "@/modules/stripe/stripe-refund-id";
import { createStripeRefundStatus } from "@/modules/stripe/stripe-refund-status";
import { createTimestampFromStripeEvent } from "@/modules/stripe/stripe-timestamps";
import { mapRefundStatusToTransactionResult } from "@/modules/transaction-result/map-refund-status-to-transaction-result";
import {
  TransactionRecorderError,
  TransactionRecorderRepo,
} from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

import { TransactionEventReportVariablesResolver } from "../transaction-event-report-variables-resolver";

export type StripeChargeHandlerSupportedEvents = Stripe.ChargeRefundUpdatedEvent;

type PossibleErrors =
  | InstanceType<
      | typeof SaleorMoney.ValidationError
      | typeof StripeRefundHandler.NotSupportedEventError
      | typeof StripeRefundHandler.MalformedEventError
    >
  | TransactionRecorderError;

export class StripeRefundHandler {
  static NotSupportedEventError = BaseError.subclass("NotSupportedEventError", {
    props: {
      __internalName: "StripeRefundHandler.NotSupportedEventError",
    },
  });

  static MalformedEventError = BaseError.subclass("MalformedEventError", {
    props: {
      __internalName: "StripeRefundHandler.MalformedEventError",
    },
  });

  private prepareTransactionEventReportParams(event: StripeChargeHandlerSupportedEvents) {
    const chargeObject = event.data.object;
    const currency = chargeObject.currency;
    const timestamp = createTimestampFromStripeEvent(event);

    const saleorMoneyResult = SaleorMoney.createFromStripe({
      amount: chargeObject.amount,
      currency,
    });

    if (saleorMoneyResult.isErr()) {
      return err(saleorMoneyResult.error);
    }

    return ok({
      saleorMoney: saleorMoneyResult.value,
      timestamp,
    });
  }

  private resolvePaymentIntentId(refund: Stripe.Refund) {
    const paymentIntentId = refund.payment_intent;

    if (!paymentIntentId) {
      return err(
        new StripeRefundHandler.MalformedEventError("Refund event does not contain payment_intent"),
      );
    }

    if (typeof paymentIntentId !== "string") {
      return ok(createStripePaymentIntentId(paymentIntentId.id));
    }

    return ok(createStripePaymentIntentId(paymentIntentId));
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

  private checkIfEventIsSupported(
    event: Stripe.Event,
  ): event is StripeChargeHandlerSupportedEvents {
    return event.type === "charge.refund.updated";
  }

  async processRefundEvent({
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
      return err(new StripeRefundHandler.NotSupportedEventError("Unsupported event type"));
    }

    const stripePaymentIntentIdResult = this.resolvePaymentIntentId(event.data.object);

    if (stripePaymentIntentIdResult.isErr()) {
      return err(stripePaymentIntentIdResult.error);
    }

    const recordedTransactionResult = await this.resolveTransactionRecord({
      transactionRecorder,
      stripePaymentIntentId: stripePaymentIntentIdResult.value,
      appId,
      saleorApiUrl,
    });

    if (recordedTransactionResult.isErr()) {
      return err(recordedTransactionResult.error);
    }

    const paramsResult = this.prepareTransactionEventReportParams(event);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const { saleorMoney, timestamp } = paramsResult.value;

    const refundId = createStripeRefundId(event.data.object.id);

    switch (event.type) {
      case "charge.refund.updated": {
        return ok(
          new TransactionEventReportVariablesResolver({
            transactionResult: mapRefundStatusToTransactionResult(
              createStripeRefundStatus(event.data.object.status),
            ),
            stripeObjectId: refundId,
            saleorTransactionId: recordedTransactionResult.value.saleorTransactionId,
            saleorMoney,
            timestamp,
            externalUrl: generateRefundStripeDashboardUrl(refundId, stripeEnv),
          }),
        );
      }
    }
  }
}
