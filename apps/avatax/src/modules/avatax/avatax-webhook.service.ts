import { AuthData } from "@saleor/app-sdk/APL";
import {
  DeprecatedOrderConfirmedSubscriptionFragment,
  ISaleorConfirmedOrderEvent,
} from "../saleor";
import { CancelOrderPayload, ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";

export class AvataxWebhookService implements ProviderWebhookService {
  constructor(private avataxClient: AvataxClient) {}

  async calculateTaxes(
    payload: CalculateTaxesPayload,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ) {
    const adapter = new AvataxCalculateTaxesAdapter(this.avataxClient);

    const response = await adapter.send(payload, avataxConfig, authData);

    return response;
  }

  async confirmOrder(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    confirmedOrderEvent: ISaleorConfirmedOrderEvent,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ) {
    const adapter = new AvataxOrderConfirmedAdapter(this.avataxClient);

    const response = await adapter.send({ order, confirmedOrderEvent }, avataxConfig, authData);

    return response;
  }

  async cancelOrder(payload: CancelOrderPayload, avataxConfig: AvataxConfig) {
    const adapter = new AvataxOrderCancelledAdapter(this.avataxClient);

    await adapter.send(payload, avataxConfig);
  }
}
