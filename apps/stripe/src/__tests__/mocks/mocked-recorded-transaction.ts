import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { createResolvedTransactionFlow, ResolvedTransationFlow } from "@/modules/resolved-transaction-flow";
import {
  createSaleorTransactionFlow,
  SaleorTransationFlow,
} from "@/modules/saleor/saleor-transaction-flow";
import { PaymentMethod } from "@/modules/stripe/payment-methods/types";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

type Params = {
  saleorTransactionId?: string;
  stripePaymentIntentId?: StripePaymentIntentId;
  selectedPaymentMethod?: PaymentMethod["type"];
  resolvedTransactionFlow?: ResolvedTransationFlow;
  saleorTransactionFlow?: SaleorTransationFlow;
};

export const getMockedRecordedTransaction = (params?: Params): RecordedTransaction => {
  const finalParams = {
    saleorTransactionId: mockedSaleorTransactionId,
    stripePaymentIntentId: mockedStripePaymentIntentId,
    saleorTransactionFlow: createSaleorTransactionFlow("CHARGE")._unsafeUnwrap(),
    resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE")._unsafeUnwrap(),
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
