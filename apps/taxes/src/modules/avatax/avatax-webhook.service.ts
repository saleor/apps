import pino from "pino";
import { OrderSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { avataxTransform } from "./avatax-transform";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-config";

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
    const model = avataxTransform.prepareSalesOrder(payload, channel, this.config);
    const result = await this.client.createTransaction(model);
    this.logger.debug(
      { createOrderTransaction: result },
      "AvataxClient createTransaction response"
    );
    return avataxTransform.prepareCalculateTaxesResponse(result);
  }

  async createOrder(order: OrderSubscriptionFragment, channel: ChannelConfig) {
    this.logger.debug({ order, channel }, "createOrder called with:");
    const model = avataxTransform.prepareSalesInvoice(order, channel, this.config);
    const result = await this.client.createTransaction(model);
    this.logger.debug({ createOrderTransaction: result }, "createTransaction response");
    return { ok: true };
  }
}
