import { Client } from "urql";
import { createLogger, Logger } from "../../lib/logger";
import { PublicAvataxConfigurationService } from "../avatax/configuration/public-avatax-configuration.service";
import { PublicTaxJarConfigurationService } from "../taxjar/configuration/public-taxjar-configuration.service";

export const TAX_PROVIDER_KEY = "tax-providers";

export class PublicTaxProvidersConfigurationService {
  private avataxConfigurationService: PublicAvataxConfigurationService;
  private taxJarConfigurationService: PublicTaxJarConfigurationService;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    this.avataxConfigurationService = new PublicAvataxConfigurationService(client, saleorApiUrl);
    this.taxJarConfigurationService = new PublicTaxJarConfigurationService(client, saleorApiUrl);
    this.logger = createLogger({
      location: "PublicTaxProvidersConfigurationService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll() {
    const taxJar = await this.taxJarConfigurationService.getAll();
    const avatax = await this.avataxConfigurationService.getAll();

    return [...taxJar, ...avatax];
  }
}
