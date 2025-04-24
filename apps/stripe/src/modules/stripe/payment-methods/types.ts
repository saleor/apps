import Stripe from "stripe";

import { ResolvedTransationFlow } from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

export interface PaymentMethod {
  type: keyof Stripe.PaymentIntent.PaymentMethodOptions;
  getResolvedTransactionFlow(saleorTransactionFlow: SaleorTransationFlow): ResolvedTransationFlow;
  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions;
}
