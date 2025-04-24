import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";
import { z } from "zod";

import {
  createResolvedTransactionFlow,
  ResolvedTransationFlow,
} from "@/modules/resolved-transaction-flow";
import { SaleorTransationFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PaymentMethodError, PaymentMethodErrorType } from "./errors";
import { PaymentMethod } from "./types";

export class CardPaymentMethod implements PaymentMethod {
  type = "card" as const;

  static TransactionInitializeSchema = z
    .object({
      paymentMethod: z.literal("card"),
    })
    .strict();

  // card support both AUTHORIZATION and CHARGE - hence we return the same value we get from Saleor
  getResolvedTransactionFlow(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Result<ResolvedTransationFlow, PaymentMethodErrorType> {
    const resolvedTransactionFlowResult = createResolvedTransactionFlow(saleorTransactionFlow);

    if (resolvedTransactionFlowResult.isErr()) {
      return err(
        new PaymentMethodError("Error resolving transaction flow", {
          cause: resolvedTransactionFlowResult.error,
        }),
      );
    }

    return ok(resolvedTransactionFlowResult.value);
  }

  getCreatePaymentIntentMethodOptions(
    saleorTransactionFlow: SaleorTransationFlow,
  ): Result<Stripe.PaymentIntentCreateParams.PaymentMethodOptions, PaymentMethodErrorType> {
    const transactionFlowResult = this.getResolvedTransactionFlow(saleorTransactionFlow);

    if (transactionFlowResult.isErr()) {
      return err(transactionFlowResult.error);
    }

    return ok({
      card: {
        /*
         * override `capture_method` only for card payment method - so storefront does not need to
         * implement different logic for AUTHORIZATION and CHARGE
         */
        capture_method: transactionFlowResult.value === "AUTHORIZATION" ? "manual" : undefined,
      },
    });
  }
}
