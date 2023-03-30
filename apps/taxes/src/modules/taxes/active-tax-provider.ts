import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { AvataxProvider } from "../avatax/avatax-provider";
import { TaxJarProvider } from "../taxjar/taxjar-provider";
import { TaxProvider } from "./tax-provider";
import { TaxProviderError } from "./tax-provider-error";
import pino from "pino";

export class ActiveTaxProvider {
  private client: TaxProvider;
  private logger: pino.Logger;

  constructor(providerInstance: ProviderConfig) {
    this.logger = createLogger({
      service: "ActiveTaxProvider",
    });

    const taxProviderName = providerInstance.provider;
    this.logger.trace({ taxProviderName }, "Constructing tax provider: ");

    switch (taxProviderName) {
      case "taxjar":
        this.client = new TaxJarProvider(providerInstance.config);
        break;

      case "avatax":
        this.client = new AvataxProvider(providerInstance.config);
        break;

      default: {
        throw new TaxProviderError(`Tax provider ${taxProviderName} doesnt match`, {
          cause: "TaxProviderNotFound",
        });
      }
    }
  }

  async calculate(payload: TaxBaseFragment, channel: ChannelConfig) {
    this.logger.debug({ payload, channel }, ".calculate called");

    return this.client.calculate(payload, channel);
  }
}
