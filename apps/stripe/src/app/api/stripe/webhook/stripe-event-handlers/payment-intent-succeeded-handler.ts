import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import {
  TransactionAuthorizationSuccess,
  TransactionChargeSuccess,
} from "@/app/api/stripe/webhook/resolved-webhook-events";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import {
  createStripePaymentIntentId,
  StripePaymentIntentValidationError,
} from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

type PossibleErrors = InstanceType<
  typeof SaleorMoney.ValidationError | typeof StripePaymentIntentValidationError
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
  }): Promise<Result<TransactionAuthorizationSuccess | TransactionChargeSuccess, PossibleErrors>> {
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
    ]);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const [amount, paymentIntentId] = paramsResult.value;

    switch (recordedTransaction.transactionFlow) {
      case "AUTHORIZATION": {
        return ok(
          new TransactionAuthorizationSuccess({
            pspRef: paymentIntentId,
            amount,
            date: eventDate,
            saleorTransactionId: recordedTransaction.saleorTransactionId,
          }),
        );
      }
      case "CHARGE": {
        return ok(
          new TransactionChargeSuccess({
            pspRef: paymentIntentId,
            amount,
            date: eventDate,
            saleorTransactionId: recordedTransaction.saleorTransactionId,
          }),
        );
      }
    }
  }
}
