import { z } from "zod";
import { channelSchema } from "./channels-config";

export const setAndReplaceChannelsInputSchema = z.object({
  channelSlug: z.string(),
  config: channelSchema,
});
