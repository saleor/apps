import { z } from "zod";
import {
  avataxInstanceConfigSchema,
  serverAvataxSchema,
} from "../taxes/providers/avatax/avatax-config";
import {
  taxJarInstanceConfigSchema,
  serverTaxJarSchema,
} from "../taxes/providers/taxjar/taxjar-config";

export const providerSchema = taxJarInstanceConfigSchema.or(avataxInstanceConfigSchema);
export const providersSchema = z.array(providerSchema.and(z.object({ id: z.string() })));

const serverProviderSchema = serverTaxJarSchema.or(serverAvataxSchema);
export const serverProvidersSchema = z.array(
  serverProviderSchema.and(z.object({ id: z.string() }))
);

export type ProvidersConfig = z.infer<typeof providersSchema>;
export type ProviderConfig = z.infer<typeof providerSchema>;

export const defaultTaxProvidersConfig: ProvidersConfig = [];

export const createDefaultConfig = () => defaultTaxProvidersConfig;
