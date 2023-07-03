import { AuthData } from "@saleor/app-sdk/APL";
import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCreatedAdapter } from "./order-created/avatax-order-created-adapter";
import { AvataxOrderFulfilledAdapter } from "./order-fulfilled/avatax-order-fulfilled-adapter";

export class AvataxWebhookService implements ProviderWebhookService {
  config = defaultAvataxConfig;
  client: AvataxClient;
  private logger: Logger;

  constructor(config: AvataxConfig, private authData: AuthData) {
    this.logger = createLogger({
      name: "AvataxWebhookService",
    });
    const avataxClient = new AvataxClient(config);

    this.config = config;
    this.client = avataxClient;
  }

  async calculateTaxes(taxBase: TaxBaseFragment) {
    const adapter = new AvataxCalculateTaxesAdapter(this.config, this.authData);

    const response = await adapter.send({ taxBase });

    return response;
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    const adapter = new AvataxOrderCreatedAdapter(this.config, this.authData);

    const response = await adapter.send({ order });

    return response;
  }

  async fulfillOrder(order: OrderFulfilledSubscriptionFragment) {
    const adapter = new AvataxOrderFulfilledAdapter(this.config);

    const response = await adapter.send({ order });

    return response;
  }
}
