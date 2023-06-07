import { Client } from "urql";
import { createLogger, Logger } from "../../lib/logger";
import { AvataxConfigurationService } from "../avatax/configuration/avatax-configuration.service";
import { TaxJarConfigurationService } from "../taxjar/configuration/taxjar-configuration.service";

export const TAX_PROVIDER_KEY = "tax-providers";

export class PublicTaxProvidersConfigurationService {
  private avataxConfigurationService: AvataxConfigurationService;
  private taxJarConfigurationService: TaxJarConfigurationService;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    this.avataxConfigurationService = new AvataxConfigurationService(client, saleorApiUrl);
    this.taxJarConfigurationService = new TaxJarConfigurationService(client, saleorApiUrl);
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
