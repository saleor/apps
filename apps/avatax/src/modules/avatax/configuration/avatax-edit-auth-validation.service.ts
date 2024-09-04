import { TRPCError } from "@trpc/server";
import { Client } from "urql";

import { AvataxInvalidCredentialsError } from "../../taxes/tax-error";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AvataxAuthValidationService } from "./avatax-auth-validation.service";
import { AvataxPatchInputTransformer } from "./avatax-patch-input-transformer";

export class AvataxEditAuthValidationService {
  constructor(private avataxPatchInputTransformer: AvataxPatchInputTransformer) {}

  async validate(id: string, input: Pick<AvataxConfig, "credentials" | "isSandbox">) {
    const credentials = await this.avataxPatchInputTransformer.patchCredentials(
      id,
      input.credentials,
    );
    const avataxClient = new AvataxClient(
      new AvataxSdkClientFactory().createClient({ ...input, credentials }),
    );

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
}
