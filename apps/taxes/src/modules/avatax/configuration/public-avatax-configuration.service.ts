import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { AvataxConfig } from "../avatax-config";
import { AvataxConfigObfuscator } from "../avatax-config-obfuscator";
import { AvataxConfigurationService } from "./avatax-configuration.service";

export class PublicAvataxConfigurationService {
  private readonly configurationService: AvataxConfigurationService;
  private readonly obfuscator: AvataxConfigObfuscator;
  constructor(client: Client, saleorApiUrl: string) {
    this.configurationService = new AvataxConfigurationService(client, saleorApiUrl);
    this.obfuscator = new AvataxConfigObfuscator();
  }

  async getAll() {
    const instances = await this.configurationService.getAll();

    return this.obfuscator.obfuscateAvataxInstances(instances);
  }

  async getById(id: string) {
    const instance = await this.configurationService.getById(id);

    return this.obfuscator.obfuscateAvataxInstance(instance);
  }

  async create(config: AvataxConfig) {
    return this.configurationService.create(config);
  }

  async update(id: string, config: DeepPartial<AvataxConfig>) {
    return this.configurationService.update(id, config);
  }

  async delete(id: string) {
    return this.configurationService.delete(id);
  }
}
