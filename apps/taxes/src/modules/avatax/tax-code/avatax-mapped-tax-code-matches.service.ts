import { AuthData } from "@saleor/app-sdk/APL";
import { Logger, createLogger } from "../../../lib/logger";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxTaxCodeAdapter } from "./avatax-tax-code-adapter";
import { AvataxTaxCodeMapper } from "./avatax-tax-code-mapper";
import { AvataxTaxCodeMatches } from "./avatax-tax-code-match-repository";
import { AvataxTaxCodeMatchesService } from "./avatax-tax-code-matches.service";

export class AvataxMappedTaxCodeMatchesService {
  private logger: Logger;
  private taxCodeMatchesService: AvataxTaxCodeMatchesService;
  private taxCodeAdapter: AvataxTaxCodeAdapter;

  constructor(config: AvataxConfig, ctx: AuthData) {
    this.logger = createLogger({ location: "AvataxMappedTaxCodeMatchesService" });

    this.taxCodeMatchesService = new AvataxTaxCodeMatchesService(ctx);
    this.taxCodeAdapter = new AvataxTaxCodeAdapter(config);
  }

  async getAll(): Promise<AvataxTaxCodeMatches> {
    const matches = await this.taxCodeMatchesService.getAll();
    const taxCodes = await this.taxCodeAdapter.getAll();

    const mapper = new AvataxTaxCodeMapper();

    return mapper.map(taxCodes, matches);
  }

  async updateMany(nextMatches: AvataxTaxCodeMatches): Promise<void> {
    await this.taxCodeMatchesService.updateMany(nextMatches);
  }
}
