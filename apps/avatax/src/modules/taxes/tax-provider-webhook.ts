import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { OrderFullyRefundedPayload } from "../../pages/api/webhooks/order-fully-refunded";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

/**
 * @deprecated -> flat abstractions
 *
 * This is not needed, it was added when more providers (avatax, taxjar) was used.
 * It can be flattened now and classes that implement this interface can be removed
 */
export interface ProviderWebhookService {
  calculateTaxes: (payload: CalculateTaxesPayload) => Promise<CalculateTaxesResponse>;
  confirmOrder: (payload: OrderConfirmedSubscriptionFragment) => Promise<CreateOrderResponse>;
  cancelOrder: (payload: OrderCancelledPayload) => Promise<void>;
  refundTransaction: (payload: OrderFullyRefundedPayload) => Promise<void>;
}
