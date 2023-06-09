import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { providersSchema } from "../../providers-configuration/providers-config";
import { TAX_PROVIDER_KEY } from "../../providers-configuration/public-providers-configuration-service";
import { AvataxConfig, AvataxInstanceConfig, avataxInstanceConfigSchema } from "../avatax-config";
import { PatchInputTransformer } from "../../providers-configuration/patch-input-transformer";
import { AvataxValidationService } from "./avatax-validation.service";

const getSchema = avataxInstanceConfigSchema;

export class AvataxConfigurationRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(client: Client, saleorApiUrl: string) {
    const settingsManager = createSettingsManager(client);

    this.crudSettingsManager = new CrudSettingsManager(
      settingsManager,
      saleorApiUrl,
      TAX_PROVIDER_KEY
    );
    this.logger = createLogger({
      location: "AvataxConfigurationRepository",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll(): Promise<AvataxInstanceConfig[]> {
    const { data } = await this.crudSettingsManager.readAll();
    const instances = providersSchema.parse(data);

    const avataxInstances = instances.filter(
      (instance) => instance.provider === "avatax"
    ) as AvataxInstanceConfig[];

    return avataxInstances;
  }

  async get(id: string): Promise<AvataxInstanceConfig> {
    const { data } = await this.crudSettingsManager.read(id);

    const instance = getSchema.parse(data);

    return instance;
  }

  async post(config: AvataxConfig): Promise<{ id: string }> {
    const result = await this.crudSettingsManager.create({
      provider: "avatax",
      config: config,
    });

    return result.data;
  }

  async patch(id: string, input: AvataxConfig): Promise<void> {
    return this.crudSettingsManager.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
