import Stripe from "stripe";

import { TransactionFlowStrategyEnum } from "@/generated/graphql";

export interface PaymentMethod {
  getSupportedTransactionFlow(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): TransactionFlowStrategyEnum;
  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
}
