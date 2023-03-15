import { z } from "zod";
import { channelSchema } from "./channels";
import { providerInstanceSchema } from "./providers";

export * from "./channels";
export * from "./providers";

export const CMS_ID_KEY = "cmsId";

export const cmsSchemaProviderInstances = z.record(z.string(), providerInstanceSchema);
export const cmsSchemaChannels = z.record(z.string(), channelSchema);
export const cmsSchema = z.object({
  providerInstances: cmsSchemaProviderInstances,
  channels: cmsSchemaChannels,
});

export type CMSSchemaProviderInstances = z.infer<typeof cmsSchemaProviderInstances>;
export type CMSSchemaChannels = z.infer<typeof cmsSchemaChannels>;
