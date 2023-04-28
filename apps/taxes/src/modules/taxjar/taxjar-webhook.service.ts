import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarCalculateTaxesAdapter } from "./calculate-taxes/taxjar-calculate-taxes-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { TaxJarOrderCreatedAdapter } from "./order-created/taxjar-order-created-adapter";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private logger: Logger;
  private config: TaxJarConfig;

  constructor(config: TaxJarConfig) {
    const taxJarClient = new TaxJarClient(config);

    this.client = taxJarClient;
    this.config = config;
    this.logger = createLogger({
      service: "TaxJarWebhookService",
    });
  }

  async calculateTaxes(taxBase: TaxBaseFragment, channelConfig: ChannelConfig) {
    this.logger.debug({ taxBase, channelConfig }, "calculateTaxes called with:");
    const adapter = new TaxJarCalculateTaxesAdapter(this.config);

    const response = await adapter.send({ channelConfig, taxBase });

    this.logger.debug({ response }, "calculateTaxes response:");
    return response;
  }

  async createOrder(order: OrderCreatedSubscriptionFragment, channelConfig: ChannelConfig) {
    this.logger.debug({ order, channelConfig }, "createOrder called with:");

    const adapter = new TaxJarOrderCreatedAdapter(this.config);

    const response = await adapter.send({ channelConfig, order });

    this.logger.debug({ response }, "createOrder response:");
    return response;
  }

  // * TaxJar doesn't require any action on order fulfillment
  async fulfillOrder() {
    return { ok: true };
  }
}
