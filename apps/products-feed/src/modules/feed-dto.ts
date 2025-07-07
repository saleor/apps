import { z } from "zod";

export const chunkFeedUrlParams = z.object({
  cursor: z.string(),
  channel: z.string(),
  url: z.string(),
});
