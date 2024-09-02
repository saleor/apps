import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";

import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { createLogger } from "../../logger";
import { CrudSettingsManager } from "../crud-settings/crud-settings.service";
import { ChannelConfig, channelsSchema } from "./channel-config";

export class ChannelConfigurationRepository {
  private crudSettingsManager: CrudSettingsManager;

  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager({
      saleorApiUrl,
      metadataKey: "channel-configuration",
      metadataManager: settingsManager,
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
