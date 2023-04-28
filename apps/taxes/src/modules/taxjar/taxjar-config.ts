import { z } from "zod";
import { obfuscateSecret } from "../../lib/utils";

const addressSchema = z.object({
  country: z.string(),
  zip: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
});

const taxJarCredentialsSchema = z.object({
  apiKey: z.string().min(1, { message: "API Key requires at least one character." }),
});

export const taxJarConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  isSandbox: z.boolean(),
  credentials: taxJarCredentialsSchema,
  address: addressSchema,
});
export type TaxJarConfig = z.infer<typeof taxJarConfigSchema>;

export const defaultTaxJarConfig: TaxJarConfig = {
  name: "",
  isSandbox: false,
  credentials: {
    apiKey: "",
  },
  address: {
    city: "",
    country: "",
    state: "",
    street: "",
    zip: "",
  },
};

export const taxJarInstanceConfigSchema = z.object({
  id: z.string(),
  provider: z.literal("taxjar"),
  config: taxJarConfigSchema,
});

export type TaxJarInstanceConfig = z.infer<typeof taxJarInstanceConfigSchema>;

export const obfuscateTaxJarConfig = (config: TaxJarConfig): TaxJarConfig => ({
  ...config,
  credentials: {
    ...config.credentials,
    apiKey: obfuscateSecret(config.credentials.apiKey),
  },
});

export const obfuscateTaxJarInstances = (
  instances: TaxJarInstanceConfig[]
): TaxJarInstanceConfig[] =>
  instances.map((instance) => ({
    ...instance,
    config: obfuscateTaxJarConfig(instance.config),
  }));
