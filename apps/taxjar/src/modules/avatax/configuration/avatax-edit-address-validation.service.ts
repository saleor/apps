import { Client } from "urql";
import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxAddressValidationService } from "./avatax-address-validation.service";
import { AvataxPatchInputTransformer } from "./avatax-patch-input-transformer";

export class AvataxEditAddressValidationService {
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

  async validate(id: string, input: AvataxConfig) {
    const transformer = new AvataxPatchInputTransformer({
      client: this.client,
      appId: this.appId,
      saleorApiUrl: this.saleorApiUrl,
    });

    const config = await transformer.patchInput(id, input);

    const avataxClient = new AvataxClient(config);
    const addressValidation = new AvataxAddressValidationService(avataxClient);

    return addressValidation.validate(input.address);
  }
}
