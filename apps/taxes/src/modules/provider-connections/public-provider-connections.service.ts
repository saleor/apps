import { Client } from "urql";
import { createLogger, Logger } from "../../lib/logger";
import { PublicAvataxConnectionService } from "../avatax/configuration/public-avatax-configuration.service";
import { PublicTaxJarConfigurationService } from "../taxjar/configuration/public-taxjar-configuration.service";

export const TAX_PROVIDER_KEY = "tax-providers";

export class PublicProviderConnectionsService {
  private avataxConfigurationService: PublicAvataxConnectionService;
  private taxJarConfigurationService: PublicTaxJarConfigurationService;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    this.avataxConfigurationService = new PublicAvataxConnectionService(client, saleorApiUrl);
    this.taxJarConfigurationService = new PublicTaxJarConfigurationService(client, saleorApiUrl);
    this.logger = createLogger({
      location: "PublicProviderConnectionsService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll() {
    const taxJar = await this.taxJarConfigurationService.getAll();
    const avatax = await this.avataxConfigurationService.getAll();

    return [...taxJar, ...avatax];
  }
}
