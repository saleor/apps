import TaxJar from "taxjar";
import { Config, TaxForOrderRes, TaxParams } from "taxjar/dist/util/types";
import { logger } from "../../../../lib/logger";
import { TaxJarConfig } from "./taxjar-config";

const createTaxJarSettings = (config: TaxJarConfig): Config => {
  const settings: Config = {
    apiKey: config.apiKey,
    apiUrl: config.isSandbox ? TaxJar.SANDBOX_API_URL : TaxJar.DEFAULT_API_URL,
  };

  return settings;
};

export class TaxJarClient {
  private client: TaxJar;

  constructor(providerConfig: TaxJarConfig) {
    logger.debug("TaxJarClient constructor");
    const settings = createTaxJarSettings(providerConfig);
    const taxJarClient = new TaxJar(settings);
    logger.info({ client: taxJarClient }, "External TaxJar client created");
    this.client = taxJarClient;
  }

  async fetchTaxesForOrder(params: TaxParams) {
    const response: TaxForOrderRes = await this.client.taxForOrder(params);
    return response;
  }
}
