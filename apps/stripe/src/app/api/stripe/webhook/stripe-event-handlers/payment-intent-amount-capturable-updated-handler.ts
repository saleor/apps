import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { BaseError } from "@/lib/errors";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatusValidationError,
} from "@/modules/stripe/stripe-payment-intent-status";
import { AuthorizationSuccessResult } from "@/modules/transaction-result/success-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { TransactionEventReportVariablesResolver } from "../transaction-event-report-variables-resolver";

type PossibleErrors = InstanceType<
  | typeof SaleorMoney.ValidationError
  | typeof StripePaymentIntentStatusValidationError
  | typeof PaymentIntentAmountCapturableUpdatedHandler.NotSupportedStatusError
>;

export class PaymentIntentAmountCapturableUpdatedHandler {
  static NotSupportedStatusError = BaseError.subclass("NotSupportedStatusError", {
    props: {
      _internalName: "PaymentIntentAmountCapturableUpdatedHandler.NotSupportedStatusError" as const,
    },
  });

  async processEvent({
    event,
    stripePaymentIntentId,
    recordedTransaction,
  }: {
    event: Stripe.PaymentIntentAmountCapturableUpdatedEvent;
    stripePaymentIntentId: StripePaymentIntentId;
    recordedTransaction: RecordedTransaction;
  }): Promise<Result<TransactionEventReportVariablesResolver, PossibleErrors>> {
    const intentObject = event.data.object;
    const currency = intentObject.currency;
    const authorizedAmount = intentObject.amount_capturable;
    const eventDate = createDateFromStripeEvent(event);

    const paramsResult = Result.combine([
      SaleorMoney.createFromStripe({
        amount: authorizedAmount,
        currency,
      }),
      createStripePaymentIntentStatus(intentObject.status),
    ]);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const [saleorMoney, paymentIntentStatus] = paramsResult.value;

    if (paymentIntentStatus !== "requires_capture") {
      return err(
        new PaymentIntentAmountCapturableUpdatedHandler.NotSupportedStatusError(
          "PaymentIntent status is not 'requires_capture'",
          {
            props: {
              status: paymentIntentStatus,
            },
          },
        ),
      );
    }

    const authorizationSuccessResult = new AuthorizationSuccessResult({
      saleorMoney,
      stripePaymentIntentId,
    });

    return ok(
      new TransactionEventReportVariablesResolver({
        transactionResult: authorizationSuccessResult,
        date: eventDate,
        saleorTransactionId: recordedTransaction.saleorTransactionId,
      }),
    );
  }
}
