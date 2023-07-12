import { z } from "zod";
import { cmsTypes } from "../../shared/cms-provider";

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
