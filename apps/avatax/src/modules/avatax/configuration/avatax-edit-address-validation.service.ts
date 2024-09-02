import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AvataxAddressValidationService } from "./avatax-address-validation.service";
import { AvataxPatchInputTransformer } from "./avatax-patch-input-transformer";

export class AvataxEditAddressValidationService {
  constructor(private avataxPatchInputTransformer: AvataxPatchInputTransformer) {}

  async validate(id: string, input: AvataxConfig) {
    const config = await this.avataxPatchInputTransformer.patchInput(id, input);

    const avataxClient = new AvataxClient(new AvataxSdkClientFactory().createClient(config));
    const addressValidation = new AvataxAddressValidationService(avataxClient);

    return addressValidation.validate(input.address);
  }
}
