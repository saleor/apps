import { Client } from "urql";
import { Logger, createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { TaxJarConfig } from "../taxjar-connection-schema";
import {
  TaxJarTaxCodeMatchRepository,
  TaxJarTaxCodeMatches,
} from "./taxjar-tax-code-match-repository";
import { TaxJarTaxCodeMapper } from "./taxjar-tax-code-mapper";
import { TaxJarTaxCodeAdapter } from "./taxjar-tax-code-adapter";

export class TaxJarTaxCodeService {
  private logger: Logger;
  private taxCodeMatchRepository: TaxJarTaxCodeMatchRepository;
  private taxCodeAdapter: TaxJarTaxCodeAdapter;

  constructor(client: Client, appId: string, saleorApiUrl: string, config: TaxJarConfig) {
    this.logger = createLogger({ location: "TaxJarTaxCodeService" });
    const settingsManager = createSettingsManager(client, appId);

    this.taxCodeMatchRepository = new TaxJarTaxCodeMatchRepository(settingsManager, saleorApiUrl);
    this.taxCodeAdapter = new TaxJarTaxCodeAdapter(config);
  }

  async getAll(): Promise<TaxJarTaxCodeMatches> {
    const matches = await this.taxCodeMatchRepository.getAll();
    const taxCodes = await this.taxCodeAdapter.getAll();

    const mapper = new TaxJarTaxCodeMapper();

    return mapper.map(taxCodes, matches);
  }

  async updateMany(nextMatches: TaxJarTaxCodeMatches): Promise<void> {
    await this.taxCodeMatchRepository.updateMany(nextMatches);
  }
}
