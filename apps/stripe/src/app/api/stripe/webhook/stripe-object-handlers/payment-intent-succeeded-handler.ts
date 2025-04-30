import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { TransactionEventReportVariablesResolver } from "@/app/api/stripe/webhook/transaction-event-report-variables-resolver";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import {
  createStripePaymentIntentStatus,
  StripePaymentIntentStatusValidationError,
} from "@/modules/stripe/stripe-payment-intent-status";
import { mapPaymentIntentStatusToTransactionResult } from "@/modules/transaction-result/map-payment-intent-status-to-transaction-result";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

type PossibleErrors = InstanceType<
  typeof SaleorMoney.ValidationError | typeof StripePaymentIntentStatusValidationError
>;

/**
 * TODO: Probably extract some shared operations like parsing common fields from webhook
 */
export class PaymentIntentSucceededHandler {
  async processEvent({
    event,
    stripePaymentIntentId,
    recordedTransaction,
  }: {
    event:
      | Stripe.PaymentIntentSucceededEvent
      | Stripe.PaymentIntentProcessingEvent
      | Stripe.PaymentIntentRequiresActionEvent;
    stripePaymentIntentId: StripePaymentIntentId;
    recordedTransaction: RecordedTransaction;
  }): Promise<Result<TransactionEventReportVariablesResolver, PossibleErrors>> {
    const intentObject = event.data.object;
    const currency = intentObject.currency;
    const amountReceived = intentObject.amount_received;
    const eventDate = createDateFromStripeEvent(event);

    const paramsResult = Result.combine([
      SaleorMoney.createFromStripe({
        amount: amountReceived,
        currency,
      }),
      createStripePaymentIntentStatus(intentObject.status),
    ]);

    if (paramsResult.isErr()) {
      return err(paramsResult.error);
    }

    const [saleorMoney, paymentIntentStatus] = paramsResult.value;

    const MappedResult = mapPaymentIntentStatusToTransactionResult(
      paymentIntentStatus,
      recordedTransaction.resolvedTransactionFlow,
    );

    const result = new MappedResult({
      saleorMoney,
      stripePaymentIntentId,
      stripeStatus: paymentIntentStatus,
    });

    return ok(
      new TransactionEventReportVariablesResolver({
        transactionResult: result,
        date: eventDate,
        saleorTransactionId: recordedTransaction.saleorTransactionId,
      }),
    );
  }
}
