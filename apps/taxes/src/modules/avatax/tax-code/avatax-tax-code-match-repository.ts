import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { z } from "zod";
import { Logger, createLogger } from "../../../lib/logger";
import { CrudSettingsManager } from "../../crud-settings/crud-settings.service";

export const avataxTaxCodeMatchSchema = z.object({
  saleorTaxClassId: z.string(),
  avataxTaxCode: z.string(),
});

export type AvataxTaxCodeMatch = z.infer<typeof avataxTaxCodeMatchSchema>;

const avataxTaxCodeMatchesSchema = z.array(
  z.object({
    id: z.string(),
    data: avataxTaxCodeMatchSchema,
  })
);

export type AvataxTaxCodeMatches = z.infer<typeof avataxTaxCodeMatchesSchema>;

const metadataKey = "avatax-tax-code-map";

export class AvataxTaxCodeMatchRepository {
  private crudSettingsManager: CrudSettingsManager;
  private logger: Logger;
  constructor(settingsManager: EncryptedMetadataManager, saleorApiUrl: string) {
    this.crudSettingsManager = new CrudSettingsManager(settingsManager, saleorApiUrl, metadataKey);
    this.logger = createLogger({
      name: "AvataxTaxCodeMatchRepository",
      metadataKey,
    });
  }

  async getAll(): Promise<AvataxTaxCodeMatches> {
    const { data } = await this.crudSettingsManager.readAll();

    return avataxTaxCodeMatchesSchema.parse(data);
  }

  async create(input: AvataxTaxCodeMatch): Promise<{ data: { id: string } }> {
    return this.crudSettingsManager.create({ data: input });
  }

  async updateById(id: string, input: AvataxTaxCodeMatch): Promise<void> {
    return this.crudSettingsManager.updateById(id, { data: input });
  }
}
