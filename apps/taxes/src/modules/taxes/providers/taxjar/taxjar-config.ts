import { z } from "zod";
import { obfuscateSecret } from "../../../../lib/utils";
import { createProviderInstanceSchema } from "../../tax-common-schema";

export const taxJarConfigSchema = z.object({
  apiKey: z.string().min(1, { message: "API Key requires at least one character." }),
  isSandbox: z.boolean(),
});
export type TaxJarConfig = z.infer<typeof taxJarConfigSchema>;

export const defaultTaxJarConfig: TaxJarConfig = {
  apiKey: "",
  isSandbox: false,
};

export const taxJarInstanceConfigSchema = createProviderInstanceSchema(
  "taxjar",
  taxJarConfigSchema
);

const transformedTaxJarConfigSchema = taxJarConfigSchema.transform((config) => {
  return {
    ...config,
    apiKey: obfuscateSecret(config.apiKey),
  };
});

export const serverTaxJarSchema = createProviderInstanceSchema(
  "taxjar",
  transformedTaxJarConfigSchema
);
