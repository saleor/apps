import type Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  type ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { type SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { type PaymentMethod } from "./types";

/**
 * https://docs.stripe.com/google-pay
 */
export class GooglePayPaymentMethod implements PaymentMethod {
  // Internally it's the card
  type = "card" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("google_pay"),
    })
    .strict();

  getResolvedTransactionFlow(saleorTransactionFlow: SaleorTransationFlow): ResolvedTransactionFlow {
    return createResolvedTransactionFlow(saleorTransactionFlow);
  }

  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    const transactionFlow = this.getResolvedTransactionFlow(saleorTransactionFlow);

    return {
      card: {
        capture_method: transactionFlow === "AUTHORIZATION" ? "manual" : undefined,
      },
    };
  }
}
