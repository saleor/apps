import pino from "pino";
import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { taxJarCalculateTaxes } from "./taxjar-calculate-taxes-transform";
import { taxJarOrderCreated } from "./taxjar-order-created-transform";

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
    const args = taxJarCalculateTaxes.transformPayload(payload, channel);
    const fetchedTaxes = await this.client.fetchTaxForOrder(args);
    this.logger.debug({ fetchedTaxes }, "fetchTaxForOrder response");

    return taxJarCalculateTaxes.transformResponse(payload, fetchedTaxes);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment, channel: ChannelConfig) {
    this.logger.debug({ order, channel }, "createOrder called with:");
    const args = taxJarOrderCreated.transformPayload(order, channel);
    const result = await this.client.createOrder(args);
    this.logger.debug({ createOrder: result }, "createOrder response");

    return taxJarOrderCreated.transformResponse(result);
  }

  async fulfillOrder() {
    return { ok: true };
  }
}
