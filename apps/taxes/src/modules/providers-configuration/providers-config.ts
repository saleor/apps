import { z } from "zod";
import { avataxInstanceConfigSchema } from "../avatax/avatax-config";
import { taxJarInstanceConfigSchema } from "../taxjar/taxjar-config";

export const providerSchema = taxJarInstanceConfigSchema.or(avataxInstanceConfigSchema);
export const providersSchema = z.array(providerSchema);

export type ProvidersConfig = z.infer<typeof providersSchema>;
export type ProviderConfig = z.infer<typeof providerSchema>;
