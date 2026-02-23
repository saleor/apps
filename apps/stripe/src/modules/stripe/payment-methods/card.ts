import type Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  type ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { type SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { type PaymentMethod } from "./types";

export class CardPaymentMethod implements PaymentMethod {
  type = "card" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("card"),
    })
    .strict();

  // card support both AUTHORIZATION and CHARGE - hence we return the same value we get from SaleorTransationFlow
  getResolvedTransactionFlow(saleorTransactionFlow: SaleorTransationFlow): ResolvedTransactionFlow {
    return createResolvedTransactionFlow(saleorTransactionFlow);
  }

  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    const transactionFlow = this.getResolvedTransactionFlow(saleorTransactionFlow);

    return {
      card: {
        /*
         * override `capture_method` only for card payment method - so storefront does not need to
         * implement different logic for AUTHORIZATION and CHARGE
         */
        capture_method: transactionFlow === "AUTHORIZATION" ? "manual" : undefined,
      },
    };
  }
}
