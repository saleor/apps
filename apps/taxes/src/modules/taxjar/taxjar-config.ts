import { z } from "zod";
import { obfuscateSecret } from "../../lib/utils";

export const taxJarConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  apiKey: z.string().min(1, { message: "API Key requires at least one character." }),
  isSandbox: z.boolean(),
});
export type TaxJarConfig = z.infer<typeof taxJarConfigSchema>;

export const defaultTaxJarConfig: TaxJarConfig = {
  name: "",
  apiKey: "",
  isSandbox: false,
};

export const taxJarInstanceConfigSchema = z.object({
  id: z.string(),
  provider: z.literal("taxjar"),
  config: taxJarConfigSchema,
});

export type TaxJarInstanceConfig = z.infer<typeof taxJarInstanceConfigSchema>;
