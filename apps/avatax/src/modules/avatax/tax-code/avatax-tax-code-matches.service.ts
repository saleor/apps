import { AuthData } from "@saleor/app-sdk/APL";

import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";

import { metadataCache } from "../../../lib/app-metadata-cache";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  AvataxTaxCodeMatch,
  AvataxTaxCodeMatches,
  AvataxTaxCodeMatchRepository,
} from "./avatax-tax-code-match-repository";

export class AvataxTaxCodeMatchesService {
  constructor(private taxCodeMatchRepository: AvataxTaxCodeMatchRepository) {}

  async getAll(): Promise<AvataxTaxCodeMatches> {
    return this.taxCodeMatchRepository.getAll();
  }

  async upsert(input: AvataxTaxCodeMatch): Promise<void | { data: { id: string } }> {
    const taxCodeMatches = await this.getAll();
    const taxCodeMatch = taxCodeMatches.find(
      (match) => match.data.saleorTaxClassId === input.saleorTaxClassId,
    );

    if (taxCodeMatch) {
      return this.taxCodeMatchRepository.updateById(taxCodeMatch.id, input);
    }

    return this.taxCodeMatchRepository.create(input);
  }

  static createFromAuthData(authData: Pick<AuthData, "saleorApiUrl" | "token" | "appId">) {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
    const settingsManager = createSettingsManager(client, authData.appId, metadataCache);

    const taxCodeMatchRepository = new AvataxTaxCodeMatchRepository(
      new CrudSettingsManager({
        metadataManager: settingsManager,
        saleorApiUrl: authData.saleorApiUrl,
        metadataKey: AvataxTaxCodeMatchRepository.metadataKey,
      }),
    );

    return new AvataxTaxCodeMatchesService(taxCodeMatchRepository);
  }
}
