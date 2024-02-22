import { SyncWebhookResponsesMap } from "@saleor/app-sdk/handlers/next";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { Result, ResultAsync } from "neverthrow";
import { TransactionModel } from "avatax/lib/models/TransactionModel";

export type CalculateTaxesResponse = SyncWebhookResponsesMap["ORDER_CALCULATE_TAXES"];

export type CreateOrderResponse = { id: string };

export interface ProviderWebhookService {
  calculateTaxes: (
    payload: CalculateTaxesPayload,
  ) => Promise<Result<CalculateTaxesResponse, Error>>;
  confirmOrder: (
    payload: OrderConfirmedSubscriptionFragment,
  ) => Promise<Result<CreateOrderResponse, Error>>;
  cancelOrder: (payload: OrderCancelledPayload) => Promise<Result<TransactionModel, Error>>;
}
