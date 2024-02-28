import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { CalculateTaxesPayload } from "../webhooks/calculate-taxes-payload";
import { AvataxConfig } from "../avatax/avatax-connection-schema";
import { AuthData } from "@saleor/app-sdk/APL";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface IAvataxService {
  calculateTaxes: (params: {
    payload: CalculateTaxesPayload;
    config: AvataxConfig;
    authData: AuthData;
  }) => Promise<CalculateTaxesResponse>;
  confirmOrder: (payload: {
    payload: OrderConfirmedSubscriptionFragment;
    config: AvataxConfig;
    authData: AuthData;
  }) => Promise<CreateOrderResponse>;
  cancelOrder: (payload: {
    payload: OrderCancelledPayload;
    config: AvataxConfig;
    authData: AuthData;
  }) => Promise<void>;
}
