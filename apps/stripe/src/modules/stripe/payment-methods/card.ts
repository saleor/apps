import { z } from "zod";

import { TransactionFlowStrategyEnum } from "@/generated/graphql";

import { PaymentMethod } from "./types";

export class CardPaymentMethod implements PaymentMethod {
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
}
