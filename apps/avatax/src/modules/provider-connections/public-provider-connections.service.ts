import { ENCRYPTED_METADATA_KEYS } from "@/lib/encrypted-metadata-keys";

import { type PublicAvataxConnectionService } from "../avatax/configuration/public-avatax-connection.service";

export const TAX_PROVIDER_KEY = ENCRYPTED_METADATA_KEYS.TAX_PROVIDERS;

export class PublicProviderConnectionsService {
  constructor(private publicAvataxConnectionService: PublicAvataxConnectionService) {}

  async getAll() {
    const avatax = await this.publicAvataxConnectionService.getAll();

    return avatax;
  }
}
