import { z } from "zod";

export const newConfigInputSchema = z.object({
  name: z.string().min(1),

  // todo fill
});

export type NewConfigInput = z.infer<typeof newConfigInputSchema>;
