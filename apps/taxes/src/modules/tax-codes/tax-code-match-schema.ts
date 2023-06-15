import { z } from "zod";

export const saleorTaxClassSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const taxCodeSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type TaxCode = z.infer<typeof taxCodeSchema>;
