import Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PaymentMethod } from "./types";

export class USBankAccountPaymentMethod implements PaymentMethod {
  type = "us_bank_account" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("us_bank_account"),
    })
    .strict();

  getResolvedTransactionFlow(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): ResolvedTransactionFlow {
    return createResolvedTransactionFlow("CHARGE");
  }

  getCreatePaymentIntentMethodOptions(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    return {
      us_bank_account: {},
    };
  }
}
