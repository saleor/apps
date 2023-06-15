import { AuthData } from "@saleor/app-sdk/APL";
import { createUrqlClientFromCtx } from "../../../lib/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  AvataxTaxCodeMatchRepository,
  AvataxTaxCodeMatches,
} from "./avatax-tax-code-match-repository";

export class AvataxTaxCodeMatchesService {
  private logger: Logger;
  private taxCodeMatchRepository: AvataxTaxCodeMatchRepository;

  constructor(ctx: AuthData) {
    this.logger = createLogger({ location: "AvataxTaxCodeMatchesService" });
    const client = createUrqlClientFromCtx(ctx);
    const { appId, saleorApiUrl } = ctx;
    const settingsManager = createSettingsManager(client, appId);

    this.taxCodeMatchRepository = new AvataxTaxCodeMatchRepository(settingsManager, saleorApiUrl);
  }

  async getAll(): Promise<AvataxTaxCodeMatches> {
    return this.taxCodeMatchRepository.getAll();
  }

  async updateMany(nextMatches: AvataxTaxCodeMatches): Promise<void> {
    await this.taxCodeMatchRepository.updateMany(nextMatches);
  }
}
