import { mockedSaleorTransactionIdBranded } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import {
  createResolvedTransactionFlow,
  ResolvedTransationFlow,
} from "@/modules/resolved-transaction-flow";
import {
  createSaleorTransactionFlow,
  SaleorTransationFlow,
} from "@/modules/saleor/saleor-transaction-flow";
import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { PaymentMethod } from "@/modules/stripe/payment-methods/types";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

type Params = {
  saleorTransactionId?: SaleorTransationId;
  stripePaymentIntentId?: StripePaymentIntentId;
  selectedPaymentMethod?: PaymentMethod["type"];
  resolvedTransactionFlow?: ResolvedTransationFlow;
  saleorTransactionFlow?: SaleorTransationFlow;
};

export const getMockedRecordedTransaction = (params?: Params): RecordedTransaction => {
  const finalParams = {
    saleorTransactionId: mockedSaleorTransactionIdBranded,
    stripePaymentIntentId: mockedStripePaymentIntentId,
    saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
    resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
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
