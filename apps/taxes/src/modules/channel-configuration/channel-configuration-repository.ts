import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { ChannelConfig, channelsSchema } from "./channel-config";
import { createLogger } from "../../logger";

export class ChannelConfigurationRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger = createLogger("ChannelConfigurationRepository");
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      "channel-configuration",
    );
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
