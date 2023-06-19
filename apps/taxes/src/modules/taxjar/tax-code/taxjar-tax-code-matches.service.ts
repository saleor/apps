import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";
import { Logger, createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  TaxJarTaxCodeMatch,
  TaxJarTaxCodeMatchRepository,
  TaxJarTaxCodeMatches,
} from "./taxjar-tax-code-match-repository";

export class TaxJarTaxCodeMatchesService {
  private logger: Logger;
  private taxCodeMatchRepository: TaxJarTaxCodeMatchRepository;

  constructor(authData: AuthData) {
    this.logger = createLogger({ name: "TaxJarTaxCodeService" });
    const client = createGraphQLClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
    const settingsManager = createSettingsManager(client, authData.appId);

    this.taxCodeMatchRepository = new TaxJarTaxCodeMatchRepository(
      settingsManager,
      authData.saleorApiUrl
    );
  }

  async getAll(): Promise<TaxJarTaxCodeMatches> {
    return this.taxCodeMatchRepository.getAll();
  }

  async upsert(input: TaxJarTaxCodeMatch): Promise<void | { data: { id: string } }> {
    const taxCodeMatches = await this.getAll();
    const taxCodeMatch = taxCodeMatches.find(
      (match) => match.data.saleorTaxClassId === input.saleorTaxClassId
    );

    if (taxCodeMatch) {
      return this.taxCodeMatchRepository.updateById(taxCodeMatch.id, input);
    }

    return this.taxCodeMatchRepository.create(input);
  }
}
