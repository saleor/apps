import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionResult } from "@/app/api/stripe/webhook/resolved-webhook-events";
import { mapPaymentIntentStatusToAppResult } from "@/modules/app-result/map-payment-intent-status-to-app-result";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import {
  createStripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatusValidationError,
} from "@/modules/stripe/stripe-payment-intent-status";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

type PossibleErrors = InstanceType<
  | typeof SaleorMoney.ValidationError
  | typeof StripePaymentIntentValidationError
  | typeof StripePaymentIntentStatusValidationError
>;

/**
 * TODO: Probably extract some shared operations like parsing common fields from webhook
 */
export class PaymentIntentSucceededHandler {
  async processEvent({
    event,
    recordedTransaction,
  }: {
    event: Stripe.PaymentIntentSucceededEvent;
    recordedTransaction: RecordedTransaction;
  }): Promise<Result<TransactionResult, PossibleErrors>> {
    const intentObject = event.data.object;
    const currency = intentObject.currency;
    const authorizedAmount = intentObject.amount_capturable;
    const capturedAmount = intentObject.amount_received;
    const eventDate = createDateFromStripeEvent(event);

    const isAuthorizationFlow = recordedTransaction.transactionFlow === "AUTHORIZATION";

    const paramsResult = Result.combine([
      SaleorMoney.createFromStripe({
        amount: isAuthorizationFlow ? authorizedAmount : capturedAmount,
        currency,
      }),
      createStripePaymentIntentId(intentObject.id),
      createStripePaymentIntentStatus(intentObject.status),
    ]);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const [saleorMoney, paymentIntentId, paymentIntentStatus] = paramsResult.value;

    const MappedResult = mapPaymentIntentStatusToAppResult(
      paymentIntentStatus,
      recordedTransaction.transactionFlow,
    );

    const result = new MappedResult({
      saleorMoney,
      stripePaymentIntentId: paymentIntentId,
      stripeStatus: paymentIntentStatus,
    });

    return ok(
      new TransactionResult({
        appResult: result,
        date: eventDate,
        saleorTransactionId: recordedTransaction.saleorTransactionId,
      }),
    );
  }
}
