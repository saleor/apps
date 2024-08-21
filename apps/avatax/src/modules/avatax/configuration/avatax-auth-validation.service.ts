import { errAsync, okAsync } from "neverthrow";

import { AvataxInvalidCredentialsError } from "../../taxes/tax-error";
import { AvataxClient } from "../avatax-client";

export class AvataxAuthValidationService {
  constructor(private avataxClient: AvataxClient) {}

  async testConnection() {
    const result = await this.avataxClient.ping();

    if (!result.authenticated) {
      return errAsync(new AvataxInvalidCredentialsError("Invalid AvaTax credentials"));
    }
    return okAsync({});
  }
}
