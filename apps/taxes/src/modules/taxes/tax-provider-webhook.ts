import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { OrderRefundedPayload } from "../../pages/api/webhooks/order-refunded";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface ProviderWebhookService {
  calculateTaxes: (payload: CalculateTaxesPayload) => Promise<CalculateTaxesResponse>;
  confirmOrder: (payload: OrderConfirmedSubscriptionFragment) => Promise<CreateOrderResponse>;
  cancelOrder: (payload: OrderCancelledPayload) => Promise<void>;
  refundTransaction: (payload: OrderRefundedPayload) => Promise<void>;
}
