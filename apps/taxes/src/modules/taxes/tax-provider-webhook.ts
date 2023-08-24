import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface ProviderWebhookService {
  calculateTaxes: (payload: TaxBaseFragment) => Promise<CalculateTaxesResponse>;
  confirmOrder: (payload: OrderConfirmedSubscriptionFragment) => Promise<CreateOrderResponse>;
  cancelOrder: (payload: OrderCancelledPayload) => Promise<void>;
}
