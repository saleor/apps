import { Client } from "urql";
import { Logger, createLogger } from "../../../lib/logger";
import { AvataxConnectionRepository } from "./avatax-connection-repository";
import { AvataxConfig, AvataxConnection } from "../avatax-connection-schema";
import { AvataxValidationService } from "./avatax-validation.service";
import { DeepPartial } from "@trpc/server";
import { PatchInputTransformer } from "../../provider-connections/patch-input-transformer";
import { AuthData } from "@saleor/app-sdk/APL";
import { createSettingsManager } from "../../app/metadata-manager";

export class AvataxConnectionService {
  private logger: Logger;
  private avataxConnectionRepository: AvataxConnectionRepository;
  constructor(client: Client, appId: string, saleorApiUrl: string) {
    this.logger = createLogger({
      location: "AvataxConnectionService",
    });

    const settingsManager = createSettingsManager(client, appId);

    this.avataxConnectionRepository = new AvataxConnectionRepository(settingsManager, saleorApiUrl);
  }

  getAll(): Promise<AvataxConnection[]> {
    return this.avataxConnectionRepository.getAll();
  }

  getById(id: string): Promise<AvataxConnection> {
    return this.avataxConnectionRepository.get(id);
  }

  async create(config: AvataxConfig): Promise<{ id: string }> {
    const validationService = new AvataxValidationService();

    await validationService.validate(config);

    return await this.avataxConnectionRepository.post(config);
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

    return this.avataxConnectionRepository.patch(id, { config: input });
  }

  async delete(id: string): Promise<void> {
    return this.avataxConnectionRepository.delete(id);
  }
}
