import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { Logger, createLogger } from "../../../lib/logger";
import { createRepositoryEntitySchema } from "../../app/repository-utils";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";

const taxJarTaxCodeMatchSchema = createRepositoryEntitySchema(
  z.object({
    saleorTaxClass: z.object({
      id: z.string(),
      name: z.string(),
    }),
    taxJarTaxCode: z.object({
      id: z.string(),
      name: z.string(),
    }),
  })
);

const taxJarTaxCodeMatchesSchema = z.array(taxJarTaxCodeMatchSchema);

type TaxJarTaxCodeMap = z.infer<typeof taxJarTaxCodeMatchesSchema>;

const metadataKey = "taxjar-tax-code-map";

export class TaxJarTaxCodeMapRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(settingsManager, saleorApiUrl, metadataKey);
    this.logger = createLogger({
      location: "TaxJarTaxCodeMapRepository",
      metadataKey,
    });
  }

  async getAll(): Promise<TaxJarTaxCodeMap> {
    const data = await this.crudSettingsManager.readAll();

    return taxJarTaxCodeMatchesSchema.parse(data);
  }

  async updateMany(nextData: TaxJarTaxCodeMap): Promise<void> {
    await this.crudSettingsManager.updateMany(nextData);
  }
}
