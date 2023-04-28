import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { createLogger, Logger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { taxJarCalculateTaxesMaps } from "./maps/taxjar-calculate-taxes-map";
import { taxJarOrderCreatedMaps } from "./maps/taxjar-order-created-map";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private logger: Logger;
  private config: TaxJarConfig;

  constructor(config: TaxJarConfig) {
    const avataxClient = new TaxJarClient(config);

    this.client = avataxClient;
    this.config = config;
    this.logger = createLogger({
      service: "TaxJarProvider",
    });
  }

  async calculateTaxes(payload: TaxBaseFragment) {
    this.logger.debug({ payload }, "calculateTaxes called with:");
    const args = taxJarCalculateTaxesMaps.mapPayload(payload, this.config);
    const fetchedTaxes = await this.client.fetchTaxForOrder(args);

    this.logger.debug({ fetchedTaxes }, "fetchTaxForOrder response");

    return taxJarCalculateTaxesMaps.mapResponse(payload, fetchedTaxes);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    this.logger.debug({ order }, "createOrder called with:");
    const args = taxJarOrderCreatedMaps.mapPayload({ order, config: this.config });
    const result = await this.client.createOrder(args);

    this.logger.debug({ createOrder: result }, "createOrder response");

    return taxJarOrderCreatedMaps.mapResponse(result);
  }

  // * TaxJar doesn't require any action on order fulfillment
  async fulfillOrder() {
    return { ok: true };
  }
}
