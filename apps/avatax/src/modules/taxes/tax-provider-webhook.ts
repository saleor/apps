import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { SaleorOrder } from "../saleor";
import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { AvataxConfig } from "../avatax/avatax-connection-schema";
import { AuthData } from "@saleor/app-sdk/APL";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export type CancelOrderPayload = { avataxId: string };

export interface ProviderWebhookService {
  calculateTaxes: (
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ) => Promise<CalculateTaxesResponse>;
  confirmOrder: (
    payload: OrderConfirmedSubscriptionFragment,
    saleorOrder: SaleorOrder,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ) => Promise<CreateOrderResponse>;
  cancelOrder: (payload: CancelOrderPayload, avataxConfig: AvataxConfig) => Promise<void>;
}
