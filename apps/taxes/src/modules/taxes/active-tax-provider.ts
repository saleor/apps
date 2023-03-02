import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { AvataxProvider } from "./providers/avatax/avatax-provider";
import { TaxJarProvider } from "./providers/taxjar/taxjar-provider";
import { TaxProvider } from "./tax-provider";
import { TaxProviderError } from "./tax-provider-error";

export class ActiveTaxProvider {
  private client: TaxProvider;

  constructor(providerInstance: ProviderConfig) {
    const logger = createLogger({});

    const taxProviderName = providerInstance.provider;
    logger.info({ taxProviderName }, "Constructing tax provider: ");

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
    return this.client.calculate(payload, channel);
  }

  async validate() {
    return this.client.validate?.();
  }
}
