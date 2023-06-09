import { Client } from "urql";
import { createLogger, Logger } from "../../lib/logger";
import { PublicAvataxConnectionService } from "../avatax/configuration/public-avatax-connection.service";
import { PublicTaxJarConnectionService } from "../taxjar/configuration/public-taxjar-connection.service";

export const TAX_PROVIDER_KEY = "tax-providers";

export class PublicProviderConnectionsService {
  private avataxConnectionService: PublicAvataxConnectionService;
  private taxJarConnectionService: PublicTaxJarConnectionService;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    this.avataxConnectionService = new PublicAvataxConnectionService(client, saleorApiUrl);
    this.taxJarConnectionService = new PublicTaxJarConnectionService(client, saleorApiUrl);
    this.logger = createLogger({
      location: "PublicProviderConnectionsService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll() {
    const taxJar = await this.taxJarConnectionService.getAll();
    const avatax = await this.avataxConnectionService.getAll();

    return [...taxJar, ...avatax];
  }
}
