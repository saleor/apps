import { z } from "zod";

export namespace RootConfig {
  /**
   * Store entire app config in single file
   * - Only one request
   * - Always transactional
   */
  export const Schema = z.object({
    segmentWriteKey: z.string().min(1),
  });

  export type Shape = z.infer<typeof Schema>;
}
