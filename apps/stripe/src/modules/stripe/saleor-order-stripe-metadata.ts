import { type AllowedStripeObjectMetadata } from "./types";

type SaleorOrderStripeMetadata = Pick<
  AllowedStripeObjectMetadata,
  "saleor_order_id" | "saleor_order_number" | "saleor_checkout_id"
>;

/**
 * Order fields are optional because installations with outdated webhook subscription queries don't send them.
 *
 * When checkout is completed, Saleor moves its transactions to the created order and unlinks the checkout,
 * so the checkout ID is resolved from `order.checkoutId` in that case.
 */
export const getSaleorOrderStripeMetadata = (args: {
  order?: { id: string; number?: string | null; checkoutId?: string | null } | null;
  checkout?: { id: string } | null;
}): SaleorOrderStripeMetadata => {
  const checkoutId = args.checkout?.id ?? args.order?.checkoutId;

  return {
    ...(args.order && { saleor_order_id: args.order.id }),
    ...(args.order?.number && { saleor_order_number: args.order.number }),
    ...(checkoutId && { saleor_checkout_id: checkoutId }),
  };
};

export const getSaleorOrderStripeDescription = (order: { number?: string | null }) =>
  order.number ? `Saleor Order #${order.number}` : undefined;
