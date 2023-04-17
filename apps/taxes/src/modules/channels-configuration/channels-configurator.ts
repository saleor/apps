import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { PrivateMetadataAppConfigurator } from "../app/app-configurator";
import { ChannelsConfig } from "./channels-config";

export class TaxChannelsConfigurator extends PrivateMetadataAppConfigurator<ChannelsConfig> {
  constructor(metadataManager: SettingsManager, saleorApiUrl: string) {
    super(metadataManager, saleorApiUrl, "tax-channels");
  }
}
