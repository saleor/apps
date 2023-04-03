import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { TaxJarWebhookService } from "../taxjar/taxjar-webhook.service";
import { ProviderWebhookService } from "./tax-provider-webhook";
import { TaxProviderError } from "./tax-provider-error";
import pino from "pino";

export class ActiveTaxProvider {
  private client: ProviderWebhookService;
  private logger: pino.Logger;
  private channel: ChannelConfig;

  constructor(providerInstance: ProviderConfig, channelConfig: ChannelConfig) {
    this.logger = createLogger({
      service: "ActiveTaxProvider",
    });

    const taxProviderName = providerInstance.provider;
    this.logger.trace({ taxProviderName }, "Constructing tax provider: ");
    this.channel = channelConfig;

    switch (taxProviderName) {
      case "taxjar":
        this.client = new TaxJarWebhookService(providerInstance.config);
        break;

      case "avatax":
        this.client = new AvataxWebhookService(providerInstance.config);
        break;

      default: {
        throw new TaxProviderError(`Tax provider ${taxProviderName} doesnt match`, {
          cause: "TaxProviderNotFound",
        });
      }
    }
  }

  async calculateTaxes(payload: TaxBaseFragment) {
    this.logger.debug({ payload }, ".calculate called");

    return this.client.calculateTaxes(payload, this.channel);
  }

  async createOrder(payload: TaxBaseFragment) {
    this.logger.debug(".createOrder called");

    return this.client.createOrder(payload, this.channel);
  }
}
