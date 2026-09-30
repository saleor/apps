import type Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  type ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { type SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { type PaymentMethod } from "./types";

/**
 * https://docs.stripe.com/payments/mobilepay
 */
export class MobilePayPaymentMethod implements PaymentMethod {
  type = "mobilepay" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("mobilepay"),
    })
    .strict();

  // MobilePay supports both AUTHORIZATION and CHARGE - hence we return the same value we get from SaleorTransationFlow
  getResolvedTransactionFlow(saleorTransactionFlow: SaleorTransationFlow): ResolvedTransactionFlow {
    return createResolvedTransactionFlow(saleorTransactionFlow);
  }

  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    const transactionFlow = this.getResolvedTransactionFlow(saleorTransactionFlow);

    return {
      mobilepay: {
        /*
         * override `capture_method` only for MobilePay payment method - so storefront does not need to
         * implement different logic for AUTHORIZATION and CHARGE
         */
        capture_method: transactionFlow === "AUTHORIZATION" ? "manual" : undefined,
      },
    };
  }
}
