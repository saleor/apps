import { AuthData } from "@saleor/app-sdk/APL";
import { createUrqlClientFromCtx } from "../../../lib/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import {
  AvataxTaxCodeMatch,
  AvataxTaxCodeMatchRepository,
  AvataxTaxCodeMatches,
} from "./avatax-tax-code-match-repository";

export class AvataxTaxCodeMatchesService {
  private logger: Logger;
  private taxCodeMatchRepository: AvataxTaxCodeMatchRepository;

  constructor(authData: AuthData) {
    this.logger = createLogger({ name: "AvataxTaxCodeMatchesService" });
    const client = createUrqlClientFromCtx(authData);
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
      (match) => match.data.saleorTaxClassId === input.saleorTaxClassId
    );

    if (taxCodeMatch) {
      return this.taxCodeMatchRepository.updateById(taxCodeMatch.id, input);
    }

    return this.taxCodeMatchRepository.create(input);
  }
}
