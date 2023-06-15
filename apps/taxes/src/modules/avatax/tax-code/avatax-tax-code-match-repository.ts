import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { Logger, createLogger } from "../../../lib/logger";
import { createRepositoryEntitySchema } from "../../app/repository-utils";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { saleorTaxClassSchema, taxCodeSchema } from "../../tax-codes/tax-code-match-schema";

const avataxTaxCodeMatchSchema = createRepositoryEntitySchema(
  z.object({
    saleorTaxClass: saleorTaxClassSchema.or(z.null()),
    avataxTaxCode: taxCodeSchema,
  })
);

const avataxTaxCodeMatchesSchema = z.array(avataxTaxCodeMatchSchema);

export type AvataxTaxCodeMatches = z.infer<typeof avataxTaxCodeMatchesSchema>;

const metadataKey = "avatax-tax-code-map";

export class AvataxTaxCodeMatchRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(settingsManager, saleorApiUrl, metadataKey);
    this.logger = createLogger({
      location: "AvataxTaxCodeMatchRepository",
      metadataKey,
    });
  }

  async getAll(): Promise<AvataxTaxCodeMatches> {
    const data = await this.crudSettingsManager.readAll();

    return avataxTaxCodeMatchesSchema.parse(data);
  }

  async updateMany(nextData: AvataxTaxCodeMatches): Promise<void> {
    await this.crudSettingsManager.updateMany(nextData);
  }
}
