import Stripe from "stripe";
import { z } from "zod";

import { TransactionFlowStrategyEnum } from "@/generated/graphql";

import { PaymentMethod } from "./types";

export class CardPaymentMethod implements PaymentMethod {
  type = "card" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("card"),
    })
    .strict();

  // card support both AUTHORIZATION and CHARGE - hence we return the same value we get from Saleor
  getSupportedTransactionFlow(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): "AUTHORIZATION" | "CHARGE" {
    return saleorTransactionFlow;
  }

  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: TransactionFlowStrategyEnum,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    const transactionFlow = this.getSupportedTransactionFlow(saleorTransactionFlow);

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
