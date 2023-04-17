import pino from "pino";
import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { taxJarCalculateTaxesMaps } from "./maps/taxjar-calculate-taxes-map";
import { taxJarOrderCreatedMaps } from "./maps/taxjar-order-created-map";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private logger: pino.Logger;

  constructor(config: TaxJarConfig) {
    const avataxClient = new TaxJarClient(config);

    this.client = avataxClient;
    this.logger = createLogger({
      service: "TaxJarProvider",
    });
  }

  async calculateTaxes(payload: TaxBaseFragment, channel: ChannelConfig) {
    this.logger.debug({ payload, channel }, "calculateTaxes called with:");
    const args = taxJarCalculateTaxesMaps.mapPayload(payload, channel);
    const fetchedTaxes = await this.client.fetchTaxForOrder(args);

    this.logger.debug({ fetchedTaxes }, "fetchTaxForOrder response");

    return taxJarCalculateTaxesMaps.mapResponse(payload, fetchedTaxes);
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
