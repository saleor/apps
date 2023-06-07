import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { providersSchema } from "../../providers-configuration/providers-config";
import { TAX_PROVIDER_KEY } from "../../providers-configuration/public-providers-configuration-service";
import {
  AvataxConfig,
  AvataxInstanceConfig,
  avataxInstanceConfigSchema,
  obfuscateAvataxConfig,
} from "../avatax-config";
import { DeepPartial } from "@trpc/server";
import { AvataxValidationService } from "./avatax-validation.service";

const getSchema = avataxInstanceConfigSchema;

export class AvataxConfigurationService {
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
      location: "AvataxConfigurationService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll(): Promise<AvataxInstanceConfig[]> {
    const { data } = await this.crudSettingsManager.readAll();
    const instances = providersSchema.parse(data);

    const avataxInstances = instances.filter(
      (instance) => instance.provider === "avatax"
    ) as AvataxInstanceConfig[];

    return avataxInstances.map((instance) => ({
      ...instance,
      config: obfuscateAvataxConfig(instance.config),
    }));
  }

  async get(id: string): Promise<AvataxInstanceConfig> {
    const { data } = await this.crudSettingsManager.read(id);

    const validation = getSchema.safeParse(data);

    if (!validation.success) {
      throw new Error(validation.error.message);
    }

    const instance = validation.data;

    return { ...instance, config: obfuscateAvataxConfig(instance.config) };
  }

  async post(config: AvataxConfig): Promise<{ id: string }> {
    const validationService = new AvataxValidationService();

    await validationService.validate(config);

    const result = await this.crudSettingsManager.create({
      provider: "avatax",
      config: config,
    });

    return result.data;
  }

  async patch(id: string, config: DeepPartial<AvataxConfig>): Promise<void> {
    const data = await this.get(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = data;

    const validationService = new AvataxValidationService();

    await validationService.validate(setting.config);

    return this.crudSettingsManager.update(id, {
      ...setting,
      config: { ...setting.config, ...config },
    });
  }

  async put(id: string, config: AvataxConfig): Promise<void> {
    const data = await this.get(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = data;

    return this.crudSettingsManager.update(id, {
      ...setting,
      config: { ...config },
    });
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
