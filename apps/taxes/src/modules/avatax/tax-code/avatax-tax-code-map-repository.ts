import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { Logger, createLogger } from "../../../lib/logger";
import { createRepositoryEntitySchema } from "../../app/repository-utils";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";
import { saleorTaxClassSchema, taxCodeSchema } from "../../tax-codes/tax-code-match-schema";

const avataxTaxCodeMatchSchema = createRepositoryEntitySchema(
  z.object({
    saleorTaxClass: saleorTaxClassSchema,
    avataxTaxCode: taxCodeSchema,
  })
);

const avataxTaxCodeMatchesSchema = z.array(avataxTaxCodeMatchSchema);

type AvataxTaxCodeMap = z.infer<typeof avataxTaxCodeMatchesSchema>;

const metadataKey = "avatax-tax-code-map";

export class AvataxTaxCodeMapRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(settingsManager, saleorApiUrl, metadataKey);
    this.logger = createLogger({
      location: "AvataxTaxCodeMapRepository",
      metadataKey,
    });
  }

  async getAll(): Promise<AvataxTaxCodeMap> {
    const data = await this.crudSettingsManager.readAll();

    return avataxTaxCodeMatchesSchema.parse(data);
  }

  async updateMany(nextData: AvataxTaxCodeMap): Promise<void> {
    await this.crudSettingsManager.updateMany(nextData);
  }
}
