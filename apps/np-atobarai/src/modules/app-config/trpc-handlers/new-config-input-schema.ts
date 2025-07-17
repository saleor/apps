import { z } from "zod";

export const newConfigInputSchema = z.object({
  name: z.string().min(1),
  merchantCode: z.string().min(1),
  shippingCompanyCode: z.string().length(5),
  skuAsName: z.boolean(),
  secretSpCode: z.string().min(1),
  terminalId: z.string().min(1),
  useSandbox: z.boolean(),
});

export type NewConfigInput = z.infer<typeof newConfigInputSchema>;
