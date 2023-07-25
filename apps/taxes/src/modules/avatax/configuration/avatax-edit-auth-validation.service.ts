import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxAuthValidationService } from "./avatax-auth-validation.service";
import { AvataxPatchInputTransformer } from "./avatax-patch-input-transformer";
import { AvataxClient } from "../avatax-client";

export class AvataxEditAuthValidationService {
  private logger: Logger;
  private client: Client;
  private appId: string;
  private saleorApiUrl: string;

  constructor({
    client,
    appId,
    saleorApiUrl,
  }: {
    client: Client;
    appId: string;
    saleorApiUrl: string;
  }) {
    this.client = client;
    this.appId = appId;
    this.saleorApiUrl = saleorApiUrl;
    this.logger = createLogger({
      name: "AvataxAuthValidationService",
    });
  }

  async validate(id: string, input: Pick<AvataxConfig, "credentials" | "isSandbox">) {
    const transformer = new AvataxPatchInputTransformer({
      client: this.client,
      appId: this.appId,
      saleorApiUrl: this.saleorApiUrl,
    });
    const credentials = await transformer.patchCredentials(id, input.credentials);
    const avataxClient = new AvataxClient({ ...input, credentials });

    const authValidationService = new AvataxAuthValidationService(avataxClient);

    return authValidationService.validate();
  }
}
