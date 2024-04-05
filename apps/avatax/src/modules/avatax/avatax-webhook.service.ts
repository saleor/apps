import { AuthData } from "@saleor/app-sdk/APL";
import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrder } from "../saleor";
import { CancelOrderPayload, ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";
import { AvataxClient } from "./avatax-client";

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
    saleorOrder: SaleorOrder,
    avataxConfig: AvataxConfig,
    authData: AuthData,
  ) {
    const adapter = new AvataxOrderConfirmedAdapter(this.avataxClient);

    const response = await adapter.send({ order, saleorOrder }, avataxConfig, authData);

    return response;
  }

  async cancelOrder(payload: CancelOrderPayload, avataxConfig: AvataxConfig) {
    const adapter = new AvataxOrderCancelledAdapter(this.avataxClient);

    await adapter.send(payload, avataxConfig);
  }
}
