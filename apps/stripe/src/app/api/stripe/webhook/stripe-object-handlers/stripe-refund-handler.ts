import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeEnv } from "@/modules/stripe/stripe-env";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { TransactionEventReportVariablesResolver } from "../transaction-event-report-variables-resolver";

export type StripeChargeHandlerSupportedEvents = Stripe.ChargeRefundUpdatedEvent;

export class StripeRefundHandler {
  private prepareTransactionEventReportParams(event: StripeChargeHandlerSupportedEvents) {
    const chargeObject = event.data.object;
    const currency = chargeObject.currency;
    const eventDate = createDateFromStripeEvent(event);

    const paramsResult = Result.combine([
      SaleorMoney.createFromStripe({
        amount: chargeObject.amount,
        currency,
      }),
    ]);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const [saleorMoney] = paramsResult.value;

    return ok({
      saleorMoney,
      eventDate,
    });
  }

  checkIfEventIsSupported(event: Stripe.Event): event is StripeChargeHandlerSupportedEvents {
    return event.type === "charge.refund.updated";
  }

  // TODO: exteact this to a common place
  private resolveTransactionResult(
    status: Stripe.ChargeRefundUpdatedEvent["data"]["object"]["status"],
    stripePaymentIntentId: StripePaymentIntentId,
    stripeEnv: StripeEnv,
  ) {
    switch (status) {
      case "succeeded":
        return new RefundSuccessResult({
          stripePaymentIntentId,
          stripeEnv,
        });
      case "pending":
        return new RefundSuccessResult({
          stripePaymentIntentId,
          stripeEnv,
        });
      case "failed":
        return new RefundFailureResult({
          stripePaymentIntentId,
          stripeEnv,
        });
      case "canceled":
        return new RefundSuccessResult({
          stripePaymentIntentId,
          stripeEnv,
        });
      default:
        return new RefundSuccessResult({
          stripePaymentIntentId,
          stripeEnv,
        });
    }
  }

  processChargeEvent(args: {
    event: StripeChargeHandlerSupportedEvents;
    recordedTransaction: RecordedTransaction;
    stripeEnv: StripeEnv;
  }) {
    const {
      event,
      recordedTransaction: { saleorTransactionId, stripePaymentIntentId },
      stripeEnv,
    } = args;

    const paramsResult = this.prepareTransactionEventReportParams(event);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const { saleorMoney, eventDate } = paramsResult.value;

    switch (event.type) {
      case "charge.refund.updated": {
        return ok(
          new TransactionEventReportVariablesResolver({
            transactionResult: this.resolveTransactionResult(
              event.data.object.status,
              stripePaymentIntentId,
              stripeEnv,
            ),
            saleorTransactionId,
            saleorMoney,
            date: eventDate,
          }),
        );
      }
    }
  }
}
