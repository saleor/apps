import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-config";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCreatedAdapter } from "./order-created/avatax-order-created-adapter";
import { AvataxOrderFulfilledAdapter } from "./order-fulfilled/avatax-order-fulfilled-adapter";

export class AvataxWebhookService implements ProviderWebhookService {
  config = defaultAvataxConfig;
  client: AvataxClient;
  private logger: Logger;

  constructor(config: AvataxConfig) {
    this.logger = createLogger({
      service: "AvataxWebhookService",
    });
    const avataxClient = new AvataxClient(config);

    this.logger.trace({ client: avataxClient }, "Internal Avatax client created");

    this.config = config;
    this.client = avataxClient;
  }

  async calculateTaxes(taxBase: TaxBaseFragment) {
    this.logger.debug({ taxBase }, "calculateTaxes called with:");
    const adapter = new AvataxCalculateTaxesAdapter(this.config);

    const response = await adapter.send({ taxBase });

    this.logger.debug({ response }, "calculateTaxes response:");

    return response;
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    const providerConfig = this.config;

    this.logger.debug({ order, providerConfig }, "createOrder called with:");

    const adapter = new AvataxOrderCreatedAdapter(this.config);

    const response = await adapter.send({ order });

    this.logger.debug({ response }, "createOrder response:");

    return response;
  }

  async fulfillOrder(order: OrderFulfilledSubscriptionFragment) {
    const providerConfig = this.config;

    this.logger.debug({ order, providerConfig }, "fulfillOrder called with:");

    const adapter = new AvataxOrderFulfilledAdapter(this.config);

    const response = await adapter.send({ order });

    this.logger.debug({ response }, "fulfillOrder response:");

    return response;
  }
}
