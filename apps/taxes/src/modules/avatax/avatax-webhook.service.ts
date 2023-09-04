import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";

export class AvataxWebhookService implements ProviderWebhookService {
  private logger: Logger;
  private config: AvataxConfig;
  private authData: AuthData;
  private configurationId: string;

  constructor({
    config,
    authData,
    configurationId,
  }: {
    config: AvataxConfig;
    authData: AuthData;
    configurationId: string;
  }) {
    this.logger = createLogger({
      name: "AvataxWebhookService",
    });

    this.config = config;
    this.authData = authData;
    this.configurationId = configurationId;
  }

  async calculateTaxes(payload: CalculateTaxesPayload) {
    const adapter = new AvataxCalculateTaxesAdapter({
      config: this.config,
      authData: this.authData,
      configurationId: this.configurationId,
    });

    const response = await adapter.send(payload);

    return response;
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    const adapter = new AvataxOrderConfirmedAdapter({
      config: this.config,
      authData: this.authData,
      configurationId: this.configurationId,
    });

    const response = await adapter.send({ order });

    return response;
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    const adapter = new AvataxOrderCancelledAdapter({
      config: this.config,
      authData: this.authData,
      configurationId: this.configurationId,
    });

    await adapter.send(payload);
  }
}
