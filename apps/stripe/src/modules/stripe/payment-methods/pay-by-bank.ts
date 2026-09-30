import type Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  type ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { type SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { type PaymentMethod } from "./types";

/**
 * https://docs.stripe.com/payments/pay-by-bank
 */
export class PayByBankPaymentMethod implements PaymentMethod {
  type = "pay_by_bank" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("pay_by_bank"),
    })
    .strict();

  getResolvedTransactionFlow(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): ResolvedTransactionFlow {
    // Pay by Bank doesn't support manual capture - payments are always charged immediately
    return createResolvedTransactionFlow("CHARGE");
  }

  getCreatePaymentIntentMethodOptions(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    return {
      pay_by_bank: {},
    };
  }
}
