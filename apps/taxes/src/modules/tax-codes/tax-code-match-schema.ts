import { z } from "zod";

export const saleorTaxClassSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const taxCodeSchema = z.object({
  id: z.string(),
  name: z.string(),
});
