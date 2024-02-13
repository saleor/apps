import { Client } from "urql";
import { Obfuscator } from "../../../lib/obfuscator";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxConnectionService } from "./avatax-connection.service";
import { createLogger } from "../../../logger";

/*
 * This class is used to merge the given input with the existing configuration.
 * The input from the edit UI is obfuscated, so we need to filter out those fields, and merge it with the existing configuration.
 */
export class AvataxPatchInputTransformer {
  private logger = createLogger("AvataxPatchInputTransformer");
  private connection: AvataxConnectionService;
  private obfuscator: Obfuscator;

  constructor({
    client,
    appId,
    saleorApiUrl,
  }: {
    client: Client;
    appId: string;
    saleorApiUrl: string;
  }) {
    this.connection = new AvataxConnectionService({ client, appId, saleorApiUrl });
    this.obfuscator = new Obfuscator();
  }

  private checkIfNotObfuscated(config: AvataxConfig) {
    return (
      !this.obfuscator.isObfuscated(config.credentials.password) &&
      !this.obfuscator.isObfuscated(config.credentials.username)
    );
  }

  async patchCredentials(id: string, input: AvataxConfig["credentials"]) {
    const connection = await this.connection.getById(id);

    const credentials: AvataxConfig["credentials"] = {
      ...connection.config.credentials,
      username: this.obfuscator.isObfuscated(input.username)
        ? connection.config.credentials.username
        : input.username,
      password: this.obfuscator.isObfuscated(input.password)
        ? connection.config.credentials.password
        : input.password,
    };

    return credentials;
  }

  async patchInput(id: string, input: AvataxConfig) {
    // We can use the input straight away if it's not obfuscated.
    if (this.checkIfNotObfuscated(input)) {
      return input;
    }

    const mergedConfig: AvataxConfig = {
      ...input,
      credentials: await this.patchCredentials(id, input.credentials),
    };

    return mergedConfig;
  }
}
