import { TaxBaseFragment } from "../../../generated/graphql";
import { logger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { TaxProvider } from "../taxes/tax-provider";
import { avataxCalculate } from "./avatax-calculate";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-config";

export class AvataxProvider implements TaxProvider {
  readonly name = "avatax";
  config = defaultAvataxConfig;
  client: AvataxClient;

  constructor(config: AvataxConfig) {
    const avataxClient = new AvataxClient(config);
    logger.info({ client: avataxClient }, "Internal Avatax client created");

    this.config = config;
    this.client = avataxClient;
  }

  async calculate(payload: TaxBaseFragment, channel: ChannelConfig) {
    logger.info("Avatax calculate");
    const model = avataxCalculate.preparePayload(payload, channel, this.config);
    logger.info(model, "Payload used for Avatax fetchTaxesForOrder");
    const result = await this.client.fetchTaxesForOrder(model);
    logger.info({ createOrderTransaction: result }, "Avatax createOrderTransaction response");
    return avataxCalculate.prepareResponse(result);
  }
}
