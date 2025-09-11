import Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  ResolvedTransactionFlow,
} from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PaymentMethod } from "./types";

/**
 * https://stripe.com/docs/payments/sepa-debit
 */
export class SepaDebitPaymentMethod implements PaymentMethod {
  type = "sepa_debit" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("sepa_debit"),
    })
    .strict();

  getResolvedTransactionFlow(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): ResolvedTransactionFlow {
    /*
     *  SEPA Direct Debit payments are always charged immediately (no authorization flow).
     *  This is because SEPA Direct Debit payments can take several days to complete,
     *  and the funds are not guaranteed until the payment clears.
     */
    return createResolvedTransactionFlow("CHARGE");
  }

  getCreatePaymentIntentMethodOptions(
    _saleorTransactionFlow: SaleorTransationFlow,
  ): Stripe.PaymentIntentCreateParams.PaymentMethodOptions {
    return {
      sepa_debit: {},
    };
  }
}
