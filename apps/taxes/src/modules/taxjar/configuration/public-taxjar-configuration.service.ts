import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { TaxJarConfig } from "../taxjar-config";
import { TaxJarConfigObfuscator } from "./taxjar-config-obfuscator";
import { TaxJarConfigurationService } from "./taxjar-configuration.service";

export class PublicTaxJarConfigurationService {
  private readonly configurationService: TaxJarConfigurationService;
  private readonly obfuscator = new TaxJarConfigObfuscator();
  constructor(client: Client, saleorApiUrl: string) {
    this.configurationService = new TaxJarConfigurationService(client, saleorApiUrl);
    this.obfuscator = new TaxJarConfigObfuscator();
  }

  async getAll() {
    const instances = await this.configurationService.getAll();

    return this.obfuscator.obfuscateInstances(instances);
  }

  async getById(id: string) {
    const instance = await this.configurationService.getById(id);

    return this.obfuscator.obfuscateInstance(instance);
  }

  async create(config: TaxJarConfig) {
    return this.configurationService.create(config);
  }

  async update(id: string, config: DeepPartial<TaxJarConfig>) {
    return this.configurationService.update(id, config);
  }

  async delete(id: string) {
    return this.configurationService.delete(id);
  }
}
