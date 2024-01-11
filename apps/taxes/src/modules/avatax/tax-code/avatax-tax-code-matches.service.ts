import { AuthData } from "@saleor/app-sdk/APL";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  AvataxTaxCodeMatch,
  AvataxTaxCodeMatchRepository,
  AvataxTaxCodeMatches,
} from "./avatax-tax-code-match-repository";
import { createGraphQLClient } from "@saleor/apps-shared";
import { createLogger } from "../../../logger";

export class AvataxTaxCodeMatchesService {
  private logger = createLogger("AvataxTaxCodeMatchesService");
  private taxCodeMatchRepository: AvataxTaxCodeMatchRepository;

  constructor(authData: AuthData) {
    const client = createGraphQLClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
    const { appId, saleorApiUrl } = authData;
    const settingsManager = createSettingsManager(client, appId);

    this.taxCodeMatchRepository = new AvataxTaxCodeMatchRepository(settingsManager, saleorApiUrl);
  }

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
}
