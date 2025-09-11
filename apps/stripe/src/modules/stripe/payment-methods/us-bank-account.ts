import Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PaymentMethod } from "./types";

/**
 * https://stripe.com/docs/payments/us-bank-account
 */
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
    /*
     *  US Bank account payments (e.g ACH) are always charged immediately (no authorization flow).
     *  This is because US Bank account payments (e.g ACH) can take several days to complete,
     *  and the funds are not guaranteed until the payment clears.
     */
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
