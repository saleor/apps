import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { Logger, createLogger } from "../../lib/logger";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { ChannelConfigProperties, channelsSchema } from "./channel-config";

export class ChannelConfigurationRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(private settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
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

  async upsert(data: ChannelConfigProperties) {
    const { slug } = data;
    const { data: channels } = await this.crudSettingsManager.readAll();

    const channel = channels.find((channel) => channel.slug === slug);

    if (channel) {
      return this.crudSettingsManager.updateById(channel.id, { config: data });
    }

    return this.crudSettingsManager.create({ config: data });
  }
}
