import TaxJar from "taxjar";
import { AddressParams, Config, CreateOrderParams, TaxParams } from "taxjar/dist/util/types";
import { createLogger, Logger } from "../../lib/logger";
import { TaxJarConfig } from "./taxjar-config";

const createTaxJarSettings = (config: TaxJarConfig): Config => {
  const settings: Config = {
    apiKey: config.credentials.apiKey,
    apiUrl: config.isSandbox ? TaxJar.SANDBOX_API_URL : TaxJar.DEFAULT_API_URL,
  };

  return settings;
};

export type FetchTaxForOrderArgs = {
  params: TaxParams;
};

export type CreateOrderArgs = {
  params: CreateOrderParams;
};

export type ValidateAddressArgs = {
  params: AddressParams;
};

export class TaxJarClient {
  private client: TaxJar;
  private logger: Logger;

  constructor(providerConfig: TaxJarConfig) {
    this.logger = createLogger({ service: "TaxJarClient" });
    this.logger.trace("TaxJarClient constructor");
    const settings = createTaxJarSettings(providerConfig);
    const taxJarClient = new TaxJar(settings);

    this.logger.trace({ client: taxJarClient }, "External TaxJar client created");
    this.client = taxJarClient;
  }

  async fetchTaxForOrder({ params }: FetchTaxForOrderArgs) {
    this.logger.trace({ params }, "fetchTaxForOrder called with:");
    const response = await this.client.taxForOrder(params);

    return response;
  }

  async ping() {
    this.logger.trace("ping called");
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

  async createOrder({ params }: CreateOrderArgs) {
    this.logger.trace({ params }, "createOrder called with:");

    return this.client.createOrder(params);
  }

  async validateAddress({ params }: ValidateAddressArgs) {
    this.logger.trace({ params }, "validateAddress called with:");

    return this.client.validateAddress(params);
  }
}
