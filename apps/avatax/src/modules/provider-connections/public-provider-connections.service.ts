import { PublicAvataxConnectionService } from "../avatax/configuration/public-avatax-connection.service";

export const TAX_PROVIDER_KEY = "tax-providers-v2";

export class PublicProviderConnectionsService {
  constructor(private publicAvataxConnectionService: PublicAvataxConnectionService) {}

  async getAll() {
    const avatax = await this.publicAvataxConnectionService.getAll();

    return avatax;
  }
}
