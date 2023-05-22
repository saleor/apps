import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { taxJarOrderCreatedMaps } from "./maps/taxjar-order-created-map";
import { TaxJarCalculateTaxesAdapter } from "./taxjar-calculate-taxes-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";

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
    this.logger.debug({ order, channel }, "createOrder called with:");
    const args = taxJarOrderCreatedMaps.mapPayload({ order, channel });
    const result = await this.client.createOrder(args);

    this.logger.debug({ createOrder: result }, "createOrder response");

    return taxJarOrderCreatedMaps.mapResponse(result);
  }

  // * TaxJar doesn't require any action on order fulfillment
  async fulfillOrder() {
    return { ok: true };
  }
}
