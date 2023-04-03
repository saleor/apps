import pino from "pino";
import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { avataxCalculate } from "./avatax-calculate";
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
    this.logger.debug({ payload, channel }, "Avatax calculate called with:");
    const model = avataxCalculate.preparePayload(payload, channel, this.config);
    const result = await this.client.createTransaction(model);
    this.logger.debug({ createOrderTransaction: result }, "Avatax createOrderTransaction response");
    return avataxCalculate.prepareResponse(result);
  }

  async createOrder() {
    throw new Error("Method not implemented.");
  }
}
