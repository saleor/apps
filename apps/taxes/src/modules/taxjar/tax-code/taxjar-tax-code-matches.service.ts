import { AuthData } from "@saleor/app-sdk/APL";
import { createUrqlClientFromCtx } from "../../../lib/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  TaxJarTaxCodeMatchRepository,
  TaxJarTaxCodeMatches,
} from "./taxjar-tax-code-match-repository";

export class TaxJarTaxCodeMatchesService {
  private logger: Logger;
  private taxCodeMatchRepository: TaxJarTaxCodeMatchRepository;

  constructor(ctx: AuthData) {
    this.logger = createLogger({ location: "TaxJarTaxCodeService" });
    const client = createUrqlClientFromCtx(ctx);
    const settingsManager = createSettingsManager(client, ctx.appId);

    this.taxCodeMatchRepository = new TaxJarTaxCodeMatchRepository(
      settingsManager,
      ctx.saleorApiUrl
    );
  }

  async getAll(): Promise<TaxJarTaxCodeMatches> {
    return this.taxCodeMatchRepository.getAll();
  }

  async updateMany(nextMatches: TaxJarTaxCodeMatches): Promise<void> {
    await this.taxCodeMatchRepository.updateMany(nextMatches);
  }
}
