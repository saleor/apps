import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { PrivateMetadataAppConfigurator } from "../app-configuration/app-configurator";
import { ProvidersConfig } from "./providers-config";

export class TaxProvidersConfigurator extends PrivateMetadataAppConfigurator<ProvidersConfig> {
  constructor(metadataManager: SettingsManager, saleorApiUrl: string) {
    super(metadataManager, saleorApiUrl, "tax-providers");
  }
}
