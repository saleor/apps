import pino from "pino";
import { Client } from "urql";
import { createLogger } from "../../lib/logger";
import { isObfuscated, obfuscateSecret } from "../../lib/utils";
import { createSettingsManager } from "../app-configuration/metadata-manager";
import { CrudSettingsConfigurator } from "../crud-settings/crud-settings.service";
import { providersSchema } from "../providers-configuration/providers-config";
import { TAX_PROVIDER_KEY } from "../providers-configuration/providers-configuration-service";
import { TaxJarClient } from "./taxjar-client";
import {
  TaxJarConfig,
  taxJarConfigSchema,
  TaxJarInstanceConfig,
  taxJarInstanceConfigSchema,
} from "./taxjar-config";

const obfuscateConfig = (config: TaxJarConfig) => ({
  ...config,
  apiKey: obfuscateSecret(config.apiKey),
});

const obfuscateProvidersConfig = (instances: TaxJarInstanceConfig[]) =>
  instances.map((instance) => ({
    ...instance,
    config: obfuscateConfig(instance.config),
  }));

const getSchema = taxJarInstanceConfigSchema.transform((instance) => ({
  ...instance,
  config: obfuscateConfig(instance.config),
}));

const patchSchema = taxJarConfigSchema.partial().transform((c) => {
  const { apiKey, ...config } = c ?? {};
  return {
    ...config,
    ...(apiKey && !isObfuscated(apiKey) && { apiKey }),
  };
});

const putSchema = taxJarConfigSchema.transform((c) => {
  const { apiKey, ...config } = c;
  return {
    ...config,
    ...(!isObfuscated(apiKey) && { apiKey }),
  };
});

export class TaxJarConfigurationService {
  private crudSettingsConfigurator: CrudSettingsConfigurator;
  private logger: pino.Logger;
  constructor(client: Client, saleorApiUrl: string) {
    const settingsManager = createSettingsManager(client);
    this.crudSettingsConfigurator = new CrudSettingsConfigurator(
      settingsManager,
      saleorApiUrl,
      TAX_PROVIDER_KEY
    );
    this.logger = createLogger({
      service: "TaxJarConfigurationService",
      metadataKey: TAX_PROVIDER_KEY,
    });
  }

  async getAll() {
    this.logger.debug(".getAll called");
    const { data } = await this.crudSettingsConfigurator.readAll();
    this.logger.debug({ settings: data }, `Fetched settings from crudSettingsConfigurator`);
    const validation = providersSchema.safeParse(data);

    if (!validation.success) {
      this.logger.error({ error: validation.error.format() }, "Validation error while getAll");
      throw new Error(validation.error.message);
    }

    const instances = validation.data.filter(
      (instance) => instance.provider === "taxjar"
    ) as TaxJarInstanceConfig[];

    return obfuscateProvidersConfig(instances);
  }

  async get(id: string) {
    this.logger.debug(`.get called with id: ${id}`);
    const { data } = await this.crudSettingsConfigurator.read(id);
    this.logger.debug({ setting: data }, `Fetched setting from crudSettingsConfigurator`);

    const validation = getSchema.safeParse(data);

    if (!validation.success) {
      this.logger.error({ error: validation.error.format() }, "Validation error while get");
      throw new Error(validation.error.message);
    }

    return validation.data;
  }

  async post(config: TaxJarConfig) {
    this.logger.debug(`.post called with value: ${JSON.stringify(config)}`);
    const taxJarClient = new TaxJarClient(config);
    const validation = await taxJarClient.ping();

    if (!validation.authenticated) {
      this.logger.error({ error: validation.error }, "Validation error while post");
      throw new Error(validation.error);
    }
    return this.crudSettingsConfigurator.create({
      provider: "taxjar",
      config: config,
    });
  }

  async patch(id: string, config: Partial<TaxJarConfig>) {
    this.logger.debug(`.patch called with id: ${id} and value: ${JSON.stringify(config)}`);
    const result = await this.get(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = result;
    const validation = patchSchema.safeParse(config);

    if (!validation.success) {
      this.logger.error({ error: validation.error.format() }, "Validation error while patch");
      throw new Error(validation.error.message);
    }

    return this.crudSettingsConfigurator.update(id, {
      ...setting,
      config: { ...setting.config, ...validation.data },
    });
  }

  async put(id: string, config: TaxJarConfig) {
    const result = await this.get(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = result;
    const validation = putSchema.safeParse(config);

    if (!validation.success) {
      this.logger.error({ error: validation.error.format() }, "Validation error while patch");
      throw new Error(validation.error.message);
    }

    this.logger.debug(`.put called with id: ${id} and value: ${JSON.stringify(config)}`);
    return this.crudSettingsConfigurator.update(id, {
      ...setting,
      config: { ...validation.data },
    });
  }

  async delete(id: string) {
    this.logger.debug(`.delete called with id: ${id}`);
    return this.crudSettingsConfigurator.delete(id);
  }
}
