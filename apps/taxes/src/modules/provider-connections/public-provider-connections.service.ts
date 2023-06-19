import { Client } from "urql";
import { createLogger, Logger } from "../../lib/logger";
import { PublicAvataxConnectionService } from "../avatax/configuration/public-avatax-connection.service";
import { PublicTaxJarConnectionService } from "../taxjar/configuration/public-taxjar-connection.service";

export const TAX_PROVIDER_KEY = "tax-providers-v2";

export class PublicProviderConnectionsService {
  private avataxConnectionService: PublicAvataxConnectionService;
  private taxJarConnectionService: PublicTaxJarConnectionService;
  private logger: Logger;
  constructor(client: Client, appId: string, saleorApiUrl: string) {
    this.avataxConnectionService = new PublicAvataxConnectionService(client, appId, saleorApiUrl);
    this.taxJarConnectionService = new PublicTaxJarConnectionService(client, appId, saleorApiUrl);
    this.logger = createLogger({
      name: "PublicProviderConnectionsService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll() {
    const taxJar = await this.taxJarConnectionService.getAll();
    const avatax = await this.avataxConnectionService.getAll();

    return [...taxJar, ...avatax];
  }
}
