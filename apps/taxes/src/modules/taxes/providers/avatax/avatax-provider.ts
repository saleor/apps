import { TaxProviderName } from "..";
import { TaxBaseFragment } from "../../../../../generated/graphql";
import { logger } from "../../../../lib/logger";
import {
  ChannelConfig,
  defaultChannelConfig,
} from "../../../channels-configuration/channels-config";
import { TaxProvider } from "../../tax-provider";
import { avataxCalculate } from "./avatax-calculate";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-config";

export class AvataxProvider implements TaxProvider {
  name = "avatax" as TaxProviderName;
  config = defaultAvataxConfig;
  client: AvataxClient;

  constructor(config: AvataxConfig) {
    const avataxClient = new AvataxClient(config);
    logger.info({ client: avataxClient }, "Internal Avatax client created");

    this.config = config;
    this.client = avataxClient;
  }

  async validate() {
    logger.info("Avatax validate");
    const validation = await this.client.ping();
    logger.info(validation, "Avatax ping result");

    if (validation.authenticated) {
      return {
        ok: true,
      };
    }

    return {
      ok: false,
      error:
        "Avalara was unable to authenticate. Check if the username and password you provided are correct.",
    };
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
