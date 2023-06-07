import { DeepPartial } from "@trpc/server";
import { TaxJarConfig } from "../taxjar-config";
import { TaxJarConfigurationService } from "./taxjar-configuration.service";
import { Client } from "urql";
import { TaxJarConfigObfuscator } from "./taxjar-config-obfuscator";

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

  async get(id: string) {
    const instance = await this.configurationService.get(id);

    return this.obfuscator.obfuscateInstance(instance);
  }

  async post(config: TaxJarConfig) {
    return this.configurationService.post(config);
  }

  async patch(id: string, config: DeepPartial<TaxJarConfig>) {
    return this.configurationService.patch(id, config);
  }

  async put(id: string, config: TaxJarConfig) {
    return this.configurationService.put(id, config);
  }

  async delete(id: string) {
    return this.configurationService.delete(id);
  }
}
