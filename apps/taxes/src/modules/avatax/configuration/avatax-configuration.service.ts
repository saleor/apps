import { Client } from "urql";
import { Logger, createLogger } from "../../../lib/logger";
import { AvataxConfigurationRepository } from "./avatax-configuration-repository";
import { AvataxConfig, AvataxInstanceConfig } from "../avatax-config";
import { AvataxValidationService } from "./avatax-validation.service";
import { DeepPartial } from "@trpc/server";
import { PatchInputTransformer } from "../../providers-configuration/patch-input-transformer";

export class AvataxConfigurationService {
  private logger: Logger;
  private taxJarConfigurationRepository: AvataxConfigurationRepository;
  constructor(client: Client, saleorApiUrl: string) {
    this.logger = createLogger({
      location: "AvataxConfigurationService",
    });

    this.taxJarConfigurationRepository = new AvataxConfigurationRepository(client, saleorApiUrl);
  }

  getAll(): Promise<AvataxInstanceConfig[]> {
    return this.taxJarConfigurationRepository.getAll();
  }

  getById(id: string): Promise<AvataxInstanceConfig> {
    return this.taxJarConfigurationRepository.get(id);
  }

  async create(config: AvataxConfig): Promise<{ id: string }> {
    const validationService = new AvataxValidationService();

    await validationService.validate(config);

    return await this.taxJarConfigurationRepository.post(config);
  }

  async update(id: string, nextConfigPartial: DeepPartial<AvataxConfig>): Promise<void> {
    const data = await this.getById(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = data;
    const prevConfig = setting.config;

    const validationService = new AvataxValidationService();
    const inputTransformer = new PatchInputTransformer();

    const input = inputTransformer.transform(nextConfigPartial, prevConfig);

    await validationService.validate(input);

    return this.taxJarConfigurationRepository.patch(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.taxJarConfigurationRepository.delete(id);
  }
}
