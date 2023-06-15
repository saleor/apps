import { z } from "zod";

const avataxConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  username: z.string().min(1, { message: "Username requires at least one character." }),
  password: z.string().min(1, { message: "Password requires at least one character." }),
  isSandbox: z.boolean(),
  companyCode: z.string().optional(),
  isAutocommit: z.boolean(),
  shippingTaxCode: z.string().optional(),
});

const avataxInstanceConfigV1Schema = z.object({
  id: z.string(),
  provider: z.literal("avatax"),
  config: avataxConfigSchema,
});

export type AvataxInstanceConfigV1 = z.infer<typeof avataxInstanceConfigV1Schema>;

const taxJarConfigSchema = z.object({
  name: z.string().min(1, { message: "Name requires at least one character." }),
  apiKey: z.string().min(1, { message: "API Key requires at least one character." }),
  isSandbox: z.boolean(),
});

const taxJarInstanceConfigV1Schema = z.object({
  id: z.string(),
  provider: z.literal("taxjar"),
  config: taxJarConfigSchema,
});

export type TaxJarInstanceConfigV1 = z.infer<typeof taxJarInstanceConfigV1Schema>;

const taxProviderV1Schema = taxJarInstanceConfigV1Schema.or(avataxInstanceConfigV1Schema);

export type TaxProviderV1 = z.infer<typeof taxProviderV1Schema>;
const taxProvidersV1Schema = z.array(taxProviderV1Schema);

export type TaxProvidersV1 = z.infer<typeof taxProvidersV1Schema>;
