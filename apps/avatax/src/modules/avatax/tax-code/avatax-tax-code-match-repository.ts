import { z } from "zod";

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
  }),
);

export type AvataxTaxCodeMatches = z.infer<typeof avataxTaxCodeMatchesSchema>;

export class AvataxTaxCodeMatchRepository {
  static metadataKey = "avatax-tax-code-map";

  constructor(private crudSettingsManager: CrudSettingsManager) {}

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
