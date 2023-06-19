import { saleorApp } from "../../saleor-app";
import { Logger, createLogger } from "../../src/lib/logger";
import { createSettingsManager } from "../../src/modules/app/metadata-manager";
import { TaxProvidersV1 } from "./tax-providers-config-schema-v1";
import { TaxProvidersPrivateMetadataManagerV1 } from "./tax-providers-metadata-manager-v1";
import { ChannelsV1 } from "./channels-config-schema-v1";

import * as dotenv from "dotenv";
import { TaxChannelsPrivateMetadataManagerV1 } from "./tax-channels-metadata-manager-v1";
import { createGraphQLClient } from "@saleor/apps-shared";

dotenv.config();

export const dummyChannelsV1Config: ChannelsV1 = {
  "default-channel": {
    providerInstanceId: "24822834-1a49-4b51-8a59-579affdb772f",
    address: {
      city: "San Francisco",
      country: "US",
      state: "CA",
      street: "Sesame Street",
      zip: "10001",
    },
    enabled: true,
  },
  "channel-pln": {
    providerInstanceId: "d15d9907-a3cb-42d2-9336-366d2366e91b",
    address: {
      city: "San Francisco",
      country: "US",
      state: "CA",
      street: "Sesame Street",
      zip: "10001",
    },
    enabled: true,
  },
};

export const dummyTaxProvidersV1Config: TaxProvidersV1 = [
  {
    provider: "avatax",
    id: "24822834-1a49-4b51-8a59-579affdb772f",
    config: {
      isAutocommit: true,
      isSandbox: true,
      name: "Avatalara1",
      password: "password",
      username: "username",
      companyCode: "companyCode",
      shippingTaxCode: "shippingTaxCode",
    },
  },
  {
    provider: "taxjar",
    id: "d15d9907-a3cb-42d2-9336-366d2366e91b",
    config: {
      isSandbox: true,
      apiKey: "apiKey",
      name: "TaxJar1",
    },
  },
];

// This class is used to generate dummy config for the app to check if the runtime migrations work as expected.
class DummyConfigGenerator {
  private logger: Logger;
  constructor(private domain: string) {
    this.logger = createLogger({
      name: "DummyConfigGenerator",
    });
  }
  private getFileApl = () => {
    return saleorApp.apl.getAll();
  };

  private generateDummyTaxProvidersConfig = (): TaxProvidersV1 => dummyTaxProvidersV1Config;

  private generateDummyTaxChannelsConfig = (): ChannelsV1 => dummyChannelsV1Config;

  generate = async () => {
    console.log("Generating dummy config");
    const apls = await this.getFileApl();

    console.log({ apls }, "Apls retrieved");

    const target = apls.find((apl) => apl.domain === this.domain);

    if (!target) {
      throw new Error(`Domain ${this.domain} not found in apls`);
    }

    const dummyTaxProvidersConfig = this.generateDummyTaxProvidersConfig();
    const dummyTaxChannelsConfig = this.generateDummyTaxChannelsConfig();

    console.log({ dummyTaxProvidersConfig, dummyTaxChannelsConfig }, "Dummy configs generated");

    const client = createGraphQLClient({
      saleorApiUrl: target.saleorApiUrl,
      token: target.token,
    });

    const metadataManager = createSettingsManager(client, target.appId);
    const taxProvidersManager = new TaxProvidersPrivateMetadataManagerV1(
      metadataManager,
      target.saleorApiUrl
    );

    const taxChannelsManager = new TaxChannelsPrivateMetadataManagerV1(
      metadataManager,
      target.saleorApiUrl
    );

    console.log("Setting dummy configs");

    await taxProvidersManager.setConfig(dummyTaxProvidersConfig);
    await taxChannelsManager.setConfig(dummyTaxChannelsConfig);

    console.log("Dummy config set");
  };
}

// const dummyConfigGenerator = new DummyConfigGenerator("");

// dummyConfigGenerator.generate();
