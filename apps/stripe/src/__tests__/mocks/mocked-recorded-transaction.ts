import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { TransactionFlow } from "@/modules/transaction-flow";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

type Params = {
  saleorTransactionId?: string;
  stripePaymentIntentId?: StripePaymentIntentId;
  transactionFlow?: TransactionFlow;
};

export const getMockedRecordedTransaction = (params?: Params): RecordedTransaction => {
  const finalParams = {
    saleorTransactionId: mockedSaleorTransactionId,
    stripePaymentIntentId: mockedStripePaymentIntentId,
    transactionFlow: "CHARGE",
    ...(params ?? {}),
  } satisfies Params;

  return new RecordedTransaction(
    finalParams.saleorTransactionId,
    finalParams.stripePaymentIntentId,
    finalParams.transactionFlow,
  );
};
