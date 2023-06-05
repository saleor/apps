import { Client } from "urql";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { Logger, createLogger } from "../../lib/logger";
import { createSettingsManager } from "../app/metadata-manager";
import { ChannelConfig, channelsSchema } from "./channel-config";

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
    this.logger.trace(".getAll called");
    const { data } = await this.crudSettingsManager.readAll();

    return channelsSchema.parse(data);
  }

  async update(slug: string, data: ChannelConfig) {
    this.logger.trace(".update called");

    await this.crudSettingsManager.update(slug, data);
  }
}
