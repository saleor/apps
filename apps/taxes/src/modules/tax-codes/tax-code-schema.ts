import { z } from "zod";

const taxCodeSchema = z.object({
  description: z.string(),
  code: z.string(),
});

export type TaxCode = z.infer<typeof taxCodeSchema>;
