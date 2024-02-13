import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  TaxJarTaxCodeMatch,
  TaxJarTaxCodeMatchRepository,
  TaxJarTaxCodeMatches,
} from "./taxjar-tax-code-match-repository";
import { createLogger } from "../../../logger";

export class TaxJarTaxCodeMatchesService {
  private logger = createLogger("TaxJarTaxCodeService");
  private taxCodeMatchRepository: TaxJarTaxCodeMatchRepository;

  constructor(authData: AuthData) {
    const client = createGraphQLClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
    const settingsManager = createSettingsManager(client, authData.appId);

    this.taxCodeMatchRepository = new TaxJarTaxCodeMatchRepository(
      settingsManager,
      authData.saleorApiUrl,
    );
  }

  async getAll(): Promise<TaxJarTaxCodeMatches> {
    return this.taxCodeMatchRepository.getAll();
  }

  async upsert(input: TaxJarTaxCodeMatch): Promise<void | { data: { id: string } }> {
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
