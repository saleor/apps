import pino from "pino";
import {
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { avataxCalculateTaxes } from "./avatax-calculate-taxes-transform";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-config";
import { avataxOrderCreated } from "./avatax-order-created-transform";
import { avataxOrderFulfilled } from "./avatax-order-fulfilled-transform";

export class AvataxWebhookService implements ProviderWebhookService {
  config = defaultAvataxConfig;
  client: AvataxClient;
  private logger: pino.Logger;

  constructor(config: AvataxConfig) {
    this.logger = createLogger({
      service: "AvataxWebhookService",
    });
    const avataxClient = new AvataxClient(config);
    this.logger.trace({ client: avataxClient }, "Internal Avatax client created");

    this.config = config;
    this.client = avataxClient;
  }

  async calculateTaxes(payload: TaxBaseFragment, channel: ChannelConfig) {
    this.logger.debug({ payload, channel }, "calculateTaxes called with:");
    const args = avataxCalculateTaxes.transformPayload(payload, channel, this.config);
    const result = await this.client.createTransaction(args);
    this.logger.debug({ createOrderTransaction: result }, "AvataxClient calculateTaxes response");
    return avataxCalculateTaxes.transformResponse(result);
  }

  async createOrder(order: OrderCreatedSubscriptionFragment, channel: ChannelConfig) {
    this.logger.debug({ order, channel }, "createOrder called with:");
    const model = avataxOrderCreated.transformPayload(order, channel, this.config);
    this.logger.debug({ model }, "will call createTransaction with");
    const result = await this.client.createTransaction(model);
    this.logger.debug({ createOrderTransaction: result }, "createOrder response");
    return avataxOrderCreated.transformResponse(result);
  }

  async fulfillOrder(order: OrderFulfilledSubscriptionFragment, channel: ChannelConfig) {
    this.logger.debug({ order, channel }, "fulfillOrder called with:");
    const args = avataxOrderFulfilled.transformPayload(order, this.config);
    this.logger.debug({ args }, "will call commitTransaction with");
    const result = await this.client.commitTransaction(args);
    this.logger.debug({ createOrderTransaction: result }, "createOrder response");
    return { ok: true };
  }
}
