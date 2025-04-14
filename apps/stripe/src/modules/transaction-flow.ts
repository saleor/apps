/**
 * Represents transaction flow that is represented by TransactionFlowStrategy in Saleor and respective charge strategy in Stripe
 */

export type TransactionFlow = "CHARGE" | "AUTHORIZATION";
