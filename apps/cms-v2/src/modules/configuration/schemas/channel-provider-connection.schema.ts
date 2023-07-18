import { cmsTypes } from "@/modules/providers/providers-registry";
import { z } from "zod";

const InputSchema = z.object({
  channelSlug: z.string().min(1),
  providerId: z.string().min(1),
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
