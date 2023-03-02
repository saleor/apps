import { z } from "zod";
import { providerSchema } from "./providers-config";

export const updateProviderInstanceInputSchema = z.object({
  id: z.string(),
  provider: providerSchema,
});

export const deleteProviderInstanceInputSchema = z.object({
  id: z.string(),
});

export const createProviderInstanceInputSchema = z.object({
  provider: providerSchema,
});
