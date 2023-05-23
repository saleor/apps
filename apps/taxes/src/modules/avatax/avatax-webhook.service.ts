import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-config";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { avataxOrderFulfilledMaps } from "./maps/avatax-order-fulfilled-map";
import { AvataxOrderCreatedAdapter } from "./order-created/avatax-order-created-adapter";

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

  async calculateTaxes(taxBase: TaxBaseFragment, channelConfig: ChannelConfig) {
    this.logger.debug({ taxBase, channelConfig }, "calculateTaxes called with:");
    const adapter = new AvataxCalculateTaxesAdapter(this.config);

    return adapter.send({ channelConfig, taxBase });
  }

  async createOrder(order: OrderCreatedSubscriptionFragment, channelConfig: ChannelConfig) {
    this.logger.debug({ order, channelConfig }, "createOrder called with:");

    const adapter = new AvataxOrderCreatedAdapter(this.config);

    return adapter.send({ channelConfig, order });
  }

  async fulfillOrder(order: OrderFulfilledSubscriptionFragment, channel: ChannelConfig) {
    this.logger.debug({ order, channel }, "fulfillOrder called with:");
    const args = avataxOrderFulfilledMaps.mapPayload({ order, config: this.config });

    this.logger.debug({ args }, "will call commitTransaction with");
    const result = await this.client.commitTransaction(args);

    this.logger.debug({ result }, "fulfillOrder response");
    return { ok: true };
  }
}
