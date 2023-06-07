import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { providersSchema } from "../../providers-configuration/providers-config";
import { TAX_PROVIDER_KEY } from "../../providers-configuration/public-providers-configuration-service";
import {
  obfuscateTaxJarConfig,
  TaxJarConfig,
  TaxJarInstanceConfig,
  taxJarInstanceConfigSchema,
} from "../taxjar-config";
import { DeepPartial } from "@trpc/server";
import { TaxJarValidationService } from "./taxjar-validation.service";

const getSchema = taxJarInstanceConfigSchema;

export class TaxJarConfigurationService {
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
      location: "TaxJarConfigurationService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll(): Promise<TaxJarInstanceConfig[]> {
    const { data } = await this.crudSettingsManager.readAll();

    const instances = providersSchema.parse(data);

    const taxJarInstances = instances.filter(
      (instance) => instance.provider === "taxjar"
    ) as TaxJarInstanceConfig[];

    return taxJarInstances.map((instance) => ({
      ...instance,
      config: obfuscateTaxJarConfig(instance.config),
    }));
  }

  async get(id: string): Promise<TaxJarInstanceConfig> {
    const { data } = await this.crudSettingsManager.read(id);

    const instance = getSchema.parse(data);

    return { ...instance, config: obfuscateTaxJarConfig(instance.config) };
  }

  async post(config: TaxJarConfig): Promise<{ id: string }> {
    const validationService = new TaxJarValidationService();

    await validationService.validate(config);

    const result = await this.crudSettingsManager.create({
      provider: "taxjar",
      config: config,
    });

    return result.data;
  }

  async patch(id: string, config: DeepPartial<TaxJarConfig>): Promise<void> {
    const data = await this.get(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = data;

    const validationService = new TaxJarValidationService();

    await validationService.validate(setting.config);

    return this.crudSettingsManager.update(id, {
      ...setting,
      config: { ...setting.config, ...config },
    });
  }

  async put(id: string, config: TaxJarConfig): Promise<void> {
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
