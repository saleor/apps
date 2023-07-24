import { Client } from "urql";
import { createLogger, Logger } from "../../../lib/logger";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxAuthValidationService } from "./avatax-auth-validation.service";
import { AvataxPatchInputTransformer } from "./avatax-patch-input-transformer";

export class AvataxEditAuthValidationService {
  private logger: Logger;

  constructor(private client: Client, private appId: string, private saleorApiUrl: string) {
    this.logger = createLogger({
      name: "AvataxAuthValidationService",
    });
  }

  async validate(id: string, input: Pick<AvataxConfig, "credentials" | "isSandbox">) {
    const transformer = new AvataxPatchInputTransformer(this.client, this.appId, this.saleorApiUrl);
    const credentials = await transformer.patchCredentials(id, input.credentials);

    const authValidationService = new AvataxAuthValidationService();

    return authValidationService.validate({ credentials, isSandbox: input.isSandbox });
  }
}
