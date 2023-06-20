import TaxJar from "taxjar";
import { AddressParams, Config, CreateOrderParams, TaxParams } from "taxjar/dist/util/types";
import { createLogger, Logger } from "../../lib/logger";
import { TaxJarConfig } from "./taxjar-connection-schema";

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
    this.logger = createLogger({ name: "TaxJarClient" });
    const settings = createTaxJarSettings(providerConfig);
    const taxJarClient = new TaxJar(settings);

    this.client = taxJarClient;
  }

  async fetchTaxForOrder({ params }: FetchTaxForOrderArgs) {
    const response = await this.client.taxForOrder(params);

    return response;
  }

  async createOrder({ params }: CreateOrderArgs) {
    return this.client.createOrder(params);
  }

  /**
   * TaxJar validateAddress doesn't work. It's turned off for now.
   * @see https://github.com/taxjar/taxjar-node/issues/70
   * @todo Revisit this when TaxJar fixes the issue. Alternatively, create a custom validation.
   */
  async validateAddress({ params }: ValidateAddressArgs) {
    // return this.client.validateAddress(params);
  }

  async getTaxCodes() {
    // ! This function doesn't accept any params. This may be troublesome if we want to do pagination/filtering on the frontend.
    return this.client.categories();
  }
}
