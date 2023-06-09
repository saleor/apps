import { Client } from "urql";
import { Logger, createLogger } from "../../../lib/logger";
import { TaxJarConfigurationRepository } from "./taxjar-configuration-repository";
import { TaxJarConfig, TaxJarInstanceConfig } from "../taxjar-config";
import { TaxJarValidationService } from "./taxjar-validation.service";
import { DeepPartial } from "@trpc/server";
import { PatchInputTransformer } from "../../providers-configuration/patch-input-transformer";

export class TaxJarConfigurationService {
  private logger: Logger;
  private taxJarConfigurationRepository: TaxJarConfigurationRepository;
  constructor(client: Client, saleorApiUrl: string) {
    this.logger = createLogger({
      location: "TaxJarConfigurationService",
    });

    this.taxJarConfigurationRepository = new TaxJarConfigurationRepository(client, saleorApiUrl);
  }

  getAll(): Promise<TaxJarInstanceConfig[]> {
    return this.taxJarConfigurationRepository.getAll();
  }

  getById(id: string): Promise<TaxJarInstanceConfig> {
    return this.taxJarConfigurationRepository.get(id);
  }

  async create(config: TaxJarConfig): Promise<{ id: string }> {
    const validationService = new TaxJarValidationService();

    await validationService.validate(config);

    return await this.taxJarConfigurationRepository.post(config);
  }

  async update(id: string, nextConfigPartial: DeepPartial<TaxJarConfig>): Promise<void> {
    const data = await this.getById(id);

    // omit the key "id"  from the result
    const { id: _, ...setting } = data;
    const prevConfig = setting.config;

    const inputTransformer = new PatchInputTransformer();

    const input = inputTransformer.transform(nextConfigPartial, prevConfig);

    const validationService = new TaxJarValidationService();

    await validationService.validate(input);

    return this.taxJarConfigurationRepository.patch(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.taxJarConfigurationRepository.delete(id);
  }
}
