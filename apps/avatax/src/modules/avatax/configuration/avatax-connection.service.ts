import { DeepPartial, TRPCError } from "@trpc/server";

import { AvataxInvalidCredentialsError } from "../../taxes/tax-error";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig, AvataxConnection } from "../avatax-connection-schema";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AvataxAuthValidationService } from "./avatax-auth-validation.service";
import { AvataxConnectionRepository } from "./avatax-connection-repository";

export class AvataxConnectionService {
  constructor(private avataxConnectionRepository: AvataxConnectionRepository) {}

  private async checkIfAuthorized(input: AvataxConfig) {
    const avataxClient = new AvataxClient(new AvataxSdkClientFactory().createClient(input));
    const authValidationService = new AvataxAuthValidationService(avataxClient);

    return authValidationService.testConnection().then((result) =>
      result.mapErr((err) => {
        switch (err.constructor) {
          case AvataxInvalidCredentialsError:
            throw new TRPCError({
              message: "Invalid AvaTax credentials",
              code: "UNAUTHORIZED",
              cause: err,
            });
        }
      }),
    );
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
