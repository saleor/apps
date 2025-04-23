import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { PaymentMethod } from "@/modules/stripe/payment-methods/types";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { TransactionFlow } from "@/modules/transaction-flow";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

type Params = {
  saleorTransactionId?: string;
  stripePaymentIntentId?: StripePaymentIntentId;
  transactionFlow?: TransactionFlow;
  selectedPaymentMethod?: PaymentMethod["type"];
  resolvedTransactionFlow?: TransactionFlow;
  saleorTransactionFlow?: TransactionFlow;
};

export const getMockedRecordedTransaction = (params?: Params): RecordedTransaction => {
  const finalParams = {
    saleorTransactionId: mockedSaleorTransactionId,
    stripePaymentIntentId: mockedStripePaymentIntentId,
    saleorTransactionFlow: "CHARGE",
    resolvedTransactionFlow: "CHARGE",
    selectedPaymentMethod: "card",
    ...(params ?? {}),
  } satisfies Params;

  return new RecordedTransaction({
    saleorTransactionId: finalParams.saleorTransactionId,
    stripePaymentIntentId: finalParams.stripePaymentIntentId,
    saleorTransactionFlow: finalParams.saleorTransactionFlow,
    resolvedTransactionFlow: finalParams.resolvedTransactionFlow,
    selectedPaymentMethod: finalParams.selectedPaymentMethod,
  });
};
