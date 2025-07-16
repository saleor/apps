import { z } from "zod";

export const newConfigInputSchema = z.object({
  name: z.string().min(1),
  fillMissingAddress: z.boolean(),
  merchantCode: z.string(),
  shippingCompanyCode: z.string(),
  skuAsName: z.boolean(),
  spCode: z.string(),
  terminalId: z.string(),
  useSandbox: z.boolean(),
});

export type NewConfigInput = z.infer<typeof newConfigInputSchema>;
