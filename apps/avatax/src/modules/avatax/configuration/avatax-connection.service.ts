import { DeepPartial } from "@trpc/server";
import { Client } from "urql";
import { createSettingsManager } from "../../app/metadata-manager";
import { AvataxConfig, AvataxConnection } from "../avatax-connection-schema";
import { AvataxConnectionRepository } from "./avatax-connection-repository";
import { AvataxAuthValidationService } from "./avatax-auth-validation.service";
import { AvataxClient } from "../avatax-client";
import { createLogger } from "../../../logger";
import { metadataCache } from "../../../lib/app-metadata-cache";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";

export class AvataxConnectionService {
  private logger = createLogger("AvataxConnectionService");
  private avataxConnectionRepository: AvataxConnectionRepository;

  constructor({
    client,
    appId,
    saleorApiUrl,
  }: {
    client: Client;
    appId: string;
    saleorApiUrl: string;
  }) {
    const settingsManager = createSettingsManager(client, appId, metadataCache);

    this.avataxConnectionRepository = new AvataxConnectionRepository(settingsManager, saleorApiUrl);
  }

  private async checkIfAuthorized(input: AvataxConfig) {
    const avataxClient = new AvataxClient(new AvataxSdkClientFactory().createClient(input));
    const authValidationService = new AvataxAuthValidationService(avataxClient);

    await authValidationService.validate();
  }

  getAll(): Promise<AvataxConnection[]> {
    return this.avataxConnectionRepository.getAll();
  }

  getById(id: string): Promise<AvataxConnection> {
    return this.avataxConnectionRepository.get(id);
  }

  async create(input: AvataxConfig): Promise<{ id: string }> {
    await this.checkIfAuthorized(input);

    return this.avataxConnectionRepository.post(input);
  }

  async update(id: string, nextConfigPartial: DeepPartial<AvataxConfig>): Promise<void> {
    const data = await this.getById(id);
    // omit the key "id"  from the result
    const { id: _, ...setting } = data;
    const prevConfig = setting.config;

    // todo: add deepRightMerge
    const input: AvataxConfig = {
      ...prevConfig,
      ...nextConfigPartial,
      credentials: {
        ...prevConfig.credentials,
        ...nextConfigPartial.credentials,
      },
      address: {
        ...prevConfig.address,
        ...nextConfigPartial.address,
      },
    };

    await this.checkIfAuthorized(input);

    return this.avataxConnectionRepository.patch(id, { config: input });
  }

  async delete(id: string): Promise<void> {
    return this.avataxConnectionRepository.delete(id);
  }
}
