import Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PaymentMethod } from "./types";

/**
 * https://docs.stripe.com/payments/ideal
 */
export class IdealPaymentMethod implements PaymentMethod {
  type = "ideal" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("ideal"),
    })
    .strict();

  // iDEAL supports both AUTHORIZATION and CHARGE - hence we return the same value we get from SaleorTransationFlow
  getResolvedTransactionFlow(saleorTransactionFlow: SaleorTransationFlow): ResolvedTransactionFlow {
    return createResolvedTransactionFlow(saleorTransactionFlow);
  }

  getCreatePaymentIntentMethodOptions(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    /*
     * iDEAL doesn't support capture_method in payment_method_options
     * The capture method is controlled at the PaymentIntent level
     */
    return {
      ideal: {
        // iDEAL supports setup_future_usage but we don't need it for basic payments
      },
    };
  }
}
