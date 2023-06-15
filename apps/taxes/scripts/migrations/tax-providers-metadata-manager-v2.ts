// TODO: MIGRATION CODE FROM CONFIG VERSION V1. REMOVE THIS FILE AFTER MIGRATION

import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { TaxProvidersV2 } from "./tax-providers-config-schema-v2";
import { TAX_PROVIDER_KEY } from "../../src/modules/provider-connections/public-provider-connections.service";

export class TaxProvidersPrivateMetadataManagerV2 {
  private metadataKey = TAX_PROVIDER_KEY;

  constructor(private metadataManager: SettingsManager, private saleorApiUrl: string) {}

  getConfig(): Promise<TaxProvidersV2 | undefined> {
    return this.metadataManager.get(this.metadataKey, this.saleorApiUrl).then((data) => {
      if (!data) {
        return data;
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        throw new Error("Invalid metadata value, cant be parsed");
      }
    });
  }

  setConfig(config: TaxProvidersV2): Promise<void> {
    return this.metadataManager.set({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
