import { z } from "zod";
import { channelSchema } from "./channel-config";

export const setAndReplaceChannelsInputSchema = z.object({
  channelSlug: z.string(),
  config: channelSchema,
});
