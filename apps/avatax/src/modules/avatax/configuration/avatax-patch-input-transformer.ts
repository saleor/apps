import { Obfuscator } from "../../../lib/obfuscator";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxConnectionService } from "./avatax-connection.service";

/*
 * This class is used to merge the given input with the existing configuration.
 * The input from the edit UI is obfuscated, so we need to filter out those fields, and merge it with the existing configuration.
 */
export class AvataxPatchInputTransformer {
  constructor(
    private avataxConnectionService: AvataxConnectionService,
    private obfuscator: Obfuscator,
  ) {}

  private checkIfNotObfuscated(config: AvataxConfig) {
    return (
      !this.obfuscator.isObfuscated(config.credentials.password) &&
      !this.obfuscator.isObfuscated(config.credentials.username)
    );
  }

  async patchCredentials(id: string, input: AvataxConfig["credentials"]) {
    const connection = await this.avataxConnectionService.getById(id);

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
