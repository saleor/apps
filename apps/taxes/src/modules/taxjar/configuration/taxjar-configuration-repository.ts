import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { providersSchema } from "../../providers-configuration/providers-config";
import { TAX_PROVIDER_KEY } from "../../providers-configuration/public-providers-configuration-service";
import { TaxJarConfig, TaxJarInstanceConfig, taxJarInstanceConfigSchema } from "../taxjar-config";

const getSchema = taxJarInstanceConfigSchema;

export class TaxJarConfigurationRepository {
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
      location: "TaxJarConfigurationRepository",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll(): Promise<TaxJarInstanceConfig[]> {
    const { data } = await this.crudSettingsManager.readAll();

    const instances = providersSchema.parse(data);

    const taxJarInstances = instances.filter(
      (instance) => instance.provider === "taxjar"
    ) as TaxJarInstanceConfig[];

    return taxJarInstances;
  }

  async get(id: string): Promise<TaxJarInstanceConfig> {
    const { data } = await this.crudSettingsManager.read(id);

    const instance = getSchema.parse(data);

    return instance;
  }

  async post(config: TaxJarConfig): Promise<{ id: string }> {
    const result = await this.crudSettingsManager.create({
      provider: "taxjar",
      config: config,
    });

    return result.data;
  }

  async patch(id: string, input: TaxJarConfig): Promise<void> {
    return this.crudSettingsManager.update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.crudSettingsManager.delete(id);
  }
}
