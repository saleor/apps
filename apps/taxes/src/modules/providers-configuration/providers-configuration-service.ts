import pino from "pino";
import { Client } from "urql";
import { createLogger } from "../../lib/logger";
import { AvataxConfigurationService } from "../avatax/avatax-configuration.service";
import { TaxJarConfigurationService } from "../taxjar/taxjar-configuration.service";

export const TAX_PROVIDER_KEY = "tax-providers";

export class TaxProvidersConfigurationService {
  private avataxConfigurationService: AvataxConfigurationService;
  private taxJarConfigurationService: TaxJarConfigurationService;
  private logger: pino.Logger;
  constructor(client: Client, saleorApiUrl: string) {
    this.avataxConfigurationService = new AvataxConfigurationService(client, saleorApiUrl);
    this.taxJarConfigurationService = new TaxJarConfigurationService(client, saleorApiUrl);
    this.logger = createLogger({
      service: "TaxProvidersConfigurationService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll() {
    this.logger.debug(".getAll called");
    const taxJar = await this.taxJarConfigurationService.getAll();
    const avatax = await this.avataxConfigurationService.getAll();
    // todo: add more clever way of joining the two. Maybe add updated_at date to the config and use it to sort?
    return [...taxJar, ...avatax];
  }
}
