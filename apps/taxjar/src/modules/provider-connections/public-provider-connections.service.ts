import { Client } from "urql";
import { PublicTaxJarConnectionService } from "../taxjar/configuration/public-taxjar-connection.service";
import { createLogger } from "../../logger";

export const TAX_PROVIDER_KEY = "tax-providers-v2";

export class PublicProviderConnectionsService {
  private taxJarConnectionService: PublicTaxJarConnectionService;
  private logger = createLogger("PublicProviderConnectionsService", {
    metadataKey: TAX_PROVIDER_KEY,
  });
  constructor({
    client,
    appId,
    saleorApiUrl,
  }: {
    client: Client;
    appId: string;
    saleorApiUrl: string;
  }) {
    this.taxJarConnectionService = new PublicTaxJarConnectionService({
      client,
      appId,
      saleorApiUrl,
    });
  }

  async getAll() {
    const taxJar = await this.taxJarConnectionService.getAll();

    return [...taxJar];
  }
}
