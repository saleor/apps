import { z } from "zod";
import { cmsTypes } from "../../shared/cms-provider";

const ConnectionInput = z.object({
  channelSlug: z.string(), // todo maybe channel ID
  providerId: z.string(),
  providerType: z.enum(cmsTypes),
});

const Connection = ConnectionInput.extend({
  id: z.string(),
});

export const ChannelProviderConnectionConfigSchema = {
  NewConnectionInput: ConnectionInput,
  Connection: Connection,
};

export type ChannelProviderConnectionInputType = z.infer<typeof ConnectionInput>;
export type ChannelProviderConnectionType = z.infer<typeof Connection>;
