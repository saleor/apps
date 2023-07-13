import { cmsTypes } from "@/modules/providers/providers-registry";
import { z } from "zod";

const InputSchema = z.object({
  channelSlug: z.string(),
  providerId: z.string(),
  providerType: z.enum(cmsTypes),
});

const FullSchema = InputSchema.extend({
  id: z.string(),
});

export namespace ChannelProviderConnectionConfig {
  export type InputShape = z.infer<typeof InputSchema>;
  export type FullShape = z.infer<typeof FullSchema>;

  export const Schema = {
    Input: InputSchema,
    Full: FullSchema,
  };
}
