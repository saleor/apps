import { Client } from "urql";
import { Logger, createLogger } from "../../../lib/logger";
import { createSettingsManager } from "../../app/metadata-manager";
import { AvataxConfig } from "../avatax-connection-schema";
import {
  AvataxTaxCodeMatchRepository,
  AvataxTaxCodeMatches,
} from "./avatax-tax-code-match-repository";
import { AvataxTaxCodeMapper } from "./avatax-tax-code-mapper";
import { AvataxTaxCodeAdapter } from "./avatax-tax-code-adapter";

export class AvataxTaxCodeService {
  private logger: Logger;
  private taxCodeMatchRepository: AvataxTaxCodeMatchRepository;
  private taxCodeAdapter: AvataxTaxCodeAdapter;

  constructor(client: Client, appId: string, saleorApiUrl: string, config: AvataxConfig) {
    this.logger = createLogger({ location: "AvataxTaxCodeService" });
    const settingsManager = createSettingsManager(client, appId);

    this.taxCodeMatchRepository = new AvataxTaxCodeMatchRepository(settingsManager, saleorApiUrl);
    this.taxCodeAdapter = new AvataxTaxCodeAdapter(config);
  }

  async getAll(): Promise<AvataxTaxCodeMatches> {
    const matches = await this.taxCodeMatchRepository.getAll();
    const taxCodes = await this.taxCodeAdapter.getAll();

    const mapper = new AvataxTaxCodeMapper();

    return mapper.map(taxCodes, matches);
  }

  async updateMany(nextMatches: AvataxTaxCodeMatches): Promise<void> {
    await this.taxCodeMatchRepository.updateMany(nextMatches);
  }
}
