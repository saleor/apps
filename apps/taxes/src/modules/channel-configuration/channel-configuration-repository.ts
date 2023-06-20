import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../lib/logger";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { ChannelConfig, channelsSchema } from "./channel-config";

export class ChannelConfigurationRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      "channel-configuration"
    );
    this.logger = createLogger({
      name: "ChannelConfigurationRepository",
    });
  }

  async getAll() {
    const { data } = await this.crudSettingsManager.readAll();

    return channelsSchema.parse(data);
  }

  async updateById(id: string, input: Pick<ChannelConfig, "config">) {
    return this.crudSettingsManager.updateById(id, input);
  }

  async create(input: Pick<ChannelConfig, "config">) {
    return this.crudSettingsManager.create(input);
  }
}
