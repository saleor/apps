import { Result } from "neverthrow";
import Stripe from "stripe";

import { ResolvedTransationFlow } from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PaymentMethodErrorType } from "./errors";

export interface PaymentMethod {
  // TODO: add here more payment methods as union
  type: "card";
  getResolvedTransactionFlow(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Result<ResolvedTransationFlow, PaymentMethodErrorType>;
  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Result<Stripe.PaymentIntentCreateParams.PaymentMethodOptions, PaymentMethodErrorType>;
}
