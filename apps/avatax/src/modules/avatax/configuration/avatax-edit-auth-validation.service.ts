import { Client } from "urql";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxAuthValidationService } from "./avatax-auth-validation.service";
import { AvataxPatchInputTransformer } from "./avatax-patch-input-transformer";
import { AvataxClient } from "../avatax-client";
import { createLogger } from "../../../logger";

export class AvataxEditAuthValidationService {
  private logger = createLogger("AvataxAuthValidationService");
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
