import type Stripe from "stripe";

import { type ResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { type SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

export interface PaymentMethod {
  type: keyof Stripe.PaymentIntent.PaymentMethodOptions;
  getResolvedTransactionFlow(saleorTransactionFlow: SaleorTransationFlow): ResolvedTransactionFlow;
  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
}
