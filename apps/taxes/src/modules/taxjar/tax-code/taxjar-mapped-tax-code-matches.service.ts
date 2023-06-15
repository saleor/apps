import { AuthData } from "@saleor/app-sdk/APL";
import { Logger, createLogger } from "../../../lib/logger";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarTaxCodeAdapter } from "./taxjar-tax-code-adapter";
import { TaxJarTaxCodeMapper } from "./taxjar-tax-code-mapper";
import { TaxJarTaxCodeMatches } from "./taxjar-tax-code-match-repository";
import { TaxJarTaxCodeMatchesService } from "./taxjar-tax-code-matches.service";

export class TaxJarMappedTaxCodeMatchesService {
  private logger: Logger;
  private taxCodeMatchesService: TaxJarTaxCodeMatchesService;
  private taxCodeAdapter: TaxJarTaxCodeAdapter;

  constructor(ctx: AuthData, config: TaxJarConfig) {
    this.logger = createLogger({ location: "TaxJarMappedTaxCodeMatchesService" });

    this.taxCodeMatchesService = new TaxJarTaxCodeMatchesService(ctx);
    this.taxCodeAdapter = new TaxJarTaxCodeAdapter(config);
  }

  async getAll(): Promise<TaxJarTaxCodeMatches> {
    const matches = await this.taxCodeMatchesService.getAll();
    const taxCodes = await this.taxCodeAdapter.getAll();

    const mapper = new TaxJarTaxCodeMapper();

    return mapper.map(taxCodes, matches);
  }

  async updateMany(nextMatches: TaxJarTaxCodeMatches): Promise<void> {
    await this.taxCodeMatchesService.updateMany(nextMatches);
  }
}
