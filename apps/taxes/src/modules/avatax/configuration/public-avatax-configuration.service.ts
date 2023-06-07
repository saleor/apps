import { DeepPartial } from "@trpc/server";
import { AvataxConfig } from "../avatax-config";
import { AvataxConfigurationService } from "./avatax-configuration.service";
import { Client } from "urql";
import { AvataxConfigObfuscator } from "../avatax-config-obfuscator";

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

  async get(id: string) {
    const instance = await this.configurationService.get(id);

    return this.obfuscator.obfuscateAvataxInstance(instance);
  }

  async post(config: AvataxConfig) {
    return this.configurationService.post(config);
  }

  async patch(id: string, config: DeepPartial<AvataxConfig>) {
    return this.configurationService.patch(id, config);
  }

  async put(id: string, config: AvataxConfig) {
    return this.configurationService.put(id, config);
  }

  async delete(id: string) {
    return this.configurationService.delete(id);
  }
}
