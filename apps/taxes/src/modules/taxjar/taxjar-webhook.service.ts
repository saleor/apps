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

  async calculateTaxes(taxBase: TaxBaseFragment, channel: ChannelConfig) {
    const adapter = new TaxJarCalculateTaxesAdapter(this.config);

    return adapter.send({ channel, taxBase });
  }

  async createOrder(order: OrderCreatedSubscriptionFragment, channel: ChannelConfig) {
    const adapter = new TaxJarOrderCreatedAdapter(this.config);

    return adapter.send({ channel, order });
  }

  // * TaxJar doesn't require any action on order fulfillment
  async fulfillOrder() {
    return { ok: true };
  }
}
