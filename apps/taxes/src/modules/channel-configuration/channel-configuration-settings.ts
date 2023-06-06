import { Client } from "urql";
import { Logger, createLogger } from "../../lib/logger";
import { createSettingsManager } from "../app/metadata-manager";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { ChannelConfigProperties, channelsSchema } from "./channel-config";

export class ChannelConfigurationSettings {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    const settingsManager = createSettingsManager(client);

    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      "channel-configuration"
    );
    this.logger = createLogger({
      service: "ChannelConfigurationSettings",
    });
  }

  async getAll() {
    const { data } = await this.crudSettingsManager.readAll();

    return channelsSchema.parse(data);
  }

  async upsert(id: string, data: ChannelConfigProperties) {
    await this.crudSettingsManager.upsert(id, { config: data });
  }
}
