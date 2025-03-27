import { errAsync, okAsync } from "neverthrow";

import { AvataxInvalidCredentialsError } from "../../taxes/tax-error";
import { AvataxClient } from "../avatax-client";

export class AvataxAuthValidationService {
  constructor(private avataxClient: AvataxClient) {}

  async testConnection() {
    const pingResult = await this.avataxClient.ping();

    if (pingResult.isErr()) {
      return errAsync(pingResult.error);
    }

    if (!pingResult.value.authenticated) {
      return errAsync(new AvataxInvalidCredentialsError("Invalid AvaTax credentials"));
    }

    return okAsync({});
  }
}
