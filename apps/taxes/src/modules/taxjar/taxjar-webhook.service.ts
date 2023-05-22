import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarCalculateTaxesAdapter } from "./taxjar-calculate-taxes-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { TaxJarOrderCreatedAdapter } from "./taxjar-order-created-adapter";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  config: TaxJarConfig;
  private logger: Logger;

  constructor(config: TaxJarConfig) {
    const taxJarClient = new TaxJarClient(config);

    this.client = taxJarClient;
    this.config = config;
    this.logger = createLogger({
      service: "TaxJarProvider",
    });
  }

  async calculateTaxes(taxBase: TaxBaseFragment, channelConfig: ChannelConfig) {
    this.logger.debug({ taxBase, channelConfig }, "calculateTaxes called with:");
    const adapter = new TaxJarCalculateTaxesAdapter(this.config);

    return adapter.send({ channelConfig, taxBase });
  }

  async createOrder(order: OrderCreatedSubscriptionFragment, channelConfig: ChannelConfig) {
    this.logger.debug({ order, channelConfig }, "createOrder called with:");

    const adapter = new TaxJarOrderCreatedAdapter(this.config);

    return adapter.send({ channelConfig, order });
  }

  // * TaxJar doesn't require any action on order fulfillment
  async fulfillOrder() {
    return { ok: true };
  }
}
