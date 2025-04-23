import Stripe from "stripe";

import { TransactionFlowStrategyEnum } from "@/generated/graphql";

export interface PaymentMethod {
  type: "card";
  getSupportedTransactionFlow(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): TransactionFlowStrategyEnum;
  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
}
