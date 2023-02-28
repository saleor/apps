import { z, ZodTypeAny } from "zod";
import { TaxProviderName } from "./providers";

export const addressSchema = z.object({
  country: z.string(),
  zip: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
});

const baseProviderInstanceSchema = z.object({
  name: z.string().min(1),
});

export const createProviderInstanceSchema = <
  TConfig extends ZodTypeAny,
  TProvider extends TaxProviderName
>(
  provider: TProvider,
  schema: TConfig
) =>
  baseProviderInstanceSchema.extend({
    provider: z.literal(provider),
    config: schema,
  });
