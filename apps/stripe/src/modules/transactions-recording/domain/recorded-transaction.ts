import { SaleorTransationId } from "@/modules/saleor/saleor-transaction-id";
import { PaymentMethod } from "@/modules/stripe/payment-methods/types";
import { StripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { ResolvedTransationFlow } from "../../resolved-transaction-flow";
import { SaleorTransationFlow } from "../../saleor/saleor-transaction-flow";

/**
 * Holds transaction that app records during it's lifetime.
 * Usually it's mainly used for persisting pair of Saleor reference (Transaction ID) and Stripe reference (PaymentIntent ID).
 *
 * TODO: Add some flag like "processed: boolean" to handle deduplication
 * TODO: Persistence should not allow overwrites - it's invariant if we try to save the same data twice
 */
export class RecordedTransaction {
  readonly saleorTransactionId: SaleorTransationId;
  readonly stripePaymentIntentId: StripePaymentIntentId;
  readonly saleorTransactionFlow: SaleorTransationFlow;
  readonly resolvedTransactionFlow: ResolvedTransationFlow;
  readonly selectedPaymentMethod: PaymentMethod["type"];

  constructor(args: {
    saleorTransactionId: SaleorTransationId;
    stripePaymentIntentId: StripePaymentIntentId;
    saleorTransactionFlow: SaleorTransationFlow;
    resolvedTransactionFlow: ResolvedTransationFlow;
    selectedPaymentMethod: PaymentMethod["type"];
  }) {
    this.saleorTransactionId = args.saleorTransactionId;
    this.stripePaymentIntentId = args.stripePaymentIntentId;
    this.saleorTransactionFlow = args.saleorTransactionFlow;
    this.resolvedTransactionFlow = args.resolvedTransactionFlow;
    this.selectedPaymentMethod = args.selectedPaymentMethod;
  }
}
