import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { AvataxAppOrder } from "../avatax/order-parser";
import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { OrderCancelledPayload } from "../webhooks/payloads/order-cancelled-payload";

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
  confirmOrder: (
    payload: OrderConfirmedSubscriptionFragment,
    avataxAppOrder: AvataxAppOrder,
  ) => Promise<CreateOrderResponse>;
  cancelOrder: (payload: OrderCancelledPayload) => Promise<void>;
}
