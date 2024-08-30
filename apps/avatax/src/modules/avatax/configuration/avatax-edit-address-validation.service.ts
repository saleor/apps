import { Client } from "urql";

import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { AvataxConnectionService } from "@/modules/avatax/configuration/avatax-connection.service";
import { AvataxConnectionRepository } from "@/modules/avatax/configuration/avatax-connection-repository";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { AvataxClient } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
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
    const transformer = new AvataxPatchInputTransformer(
      new AvataxConnectionService(
        new AvataxConnectionRepository(
          new CrudSettingsManager(
            createSettingsManager(this.client, this.appId, metadataCache),
            this.saleorApiUrl,
            TAX_PROVIDER_KEY,
          ),
        ),
      ),
    );

    const config = await transformer.patchInput(id, input);

    const avataxClient = new AvataxClient(new AvataxSdkClientFactory().createClient(config));
    const addressValidation = new AvataxAddressValidationService(avataxClient);

    return addressValidation.validate(input.address);
  }
}
