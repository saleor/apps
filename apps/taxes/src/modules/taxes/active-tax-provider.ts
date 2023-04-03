import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { AvataxWebhookService } from "../avatax/avatax-webhook.service";
import { TaxJarWebhookService } from "../taxjar/taxjar-webhook.service";
import { ProviderWebhookService } from "./tax-provider-webhook";
import { TaxProviderError } from "./tax-provider-error";
import pino from "pino";

export class ActiveTaxProvider implements ProviderWebhookService {
  private client: ProviderWebhookService;
  private logger: pino.Logger;

  constructor(providerInstance: ProviderConfig) {
    this.logger = createLogger({
      service: "ActiveTaxProvider",
    });

    const taxProviderName = providerInstance.provider;
    this.logger.trace({ taxProviderName }, "Constructing tax provider: ");

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

  async calculateTaxes(payload: TaxBaseFragment, channel: ChannelConfig) {
    this.logger.debug({ payload, channel }, ".calculate called");

    return this.client.calculateTaxes(payload, channel);
  }

  async createOrder() {
    this.logger.debug(".createOrder called");

    return this.client.createOrder();
  }
}
