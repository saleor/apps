import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../lib/logger";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { ChannelConfigProperties, channelsSchema } from "./channel-config";

export class ChannelConfigurationSettings {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(private settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      "channel-configuration"
    );
    this.logger = createLogger({
      location: "ChannelConfigurationSettings",
    });
  }

  async getAll() {
    const { data } = await this.crudSettingsManager.readAll();

    return channelsSchema.parse(data);
  }

  async updateById(id: string, data: ChannelConfigProperties) {
    await this.crudSettingsManager.updateById(id, { config: data });
  }
}
