import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { Logger, createLogger } from "../../../lib/logger";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";

export const taxJarTaxCodeMatchSchema = z.object({
  saleorTaxClassId: z.string(),
  taxJarTaxCode: z.string(),
});

export type TaxJarTaxCodeMatch = z.infer<typeof taxJarTaxCodeMatchSchema>;

const taxJarTaxCodeMatchesSchema = z.array(
  z.object({
    id: z.string(),
    data: taxJarTaxCodeMatchSchema,
  })
);

export type TaxJarTaxCodeMatches = z.infer<typeof taxJarTaxCodeMatchesSchema>;

const metadataKey = "taxjar-tax-code-map";

export class TaxJarTaxCodeMatchRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(settingsManager, saleorApiUrl, metadataKey);
    this.logger = createLogger({
      name: "TaxJarTaxCodeMatchRepository",
      metadataKey,
    });
  }

  async getAll(): Promise<TaxJarTaxCodeMatches> {
    const { data } = await this.crudSettingsManager.readAll();

    return taxJarTaxCodeMatchesSchema.parse(data);
  }

  async create(input: TaxJarTaxCodeMatch): Promise<void> {
    await this.crudSettingsManager.create({ data: input });
  }

  async updateById(id: string, input: TaxJarTaxCodeMatch): Promise<void> {
    await this.crudSettingsManager.updateById(id, { data: input });
  }
}
