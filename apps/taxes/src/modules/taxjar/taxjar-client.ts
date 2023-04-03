import pino from "pino";
import TaxJar from "taxjar";
import { Config, TaxForOrderRes, TaxParams } from "taxjar/dist/util/types";
import { createLogger } from "../../lib/logger";
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
  private logger: pino.Logger;

  constructor(providerConfig: TaxJarConfig) {
    this.logger = createLogger({ service: "TaxJarClient" });
    this.logger.trace("TaxJarClient constructor");
    const settings = createTaxJarSettings(providerConfig);
    const taxJarClient = new TaxJar(settings);
    this.logger.trace({ client: taxJarClient }, "External TaxJar client created");
    this.client = taxJarClient;
  }

  async fetchTaxForOrder(params: TaxParams) {
    this.logger.debug({ params }, "fetchTaxesForOrder called with:");
    const response: TaxForOrderRes = await this.client.taxForOrder(params);
    return response;
  }

  async ping() {
    this.logger.debug("ping called");
    try {
      await this.client.categories();
      return { authenticated: true };
    } catch (error) {
      return {
        authenticated: false,
        error: "TaxJar was not able to authenticate with the provided credentials.",
      };
    }
  }
}
