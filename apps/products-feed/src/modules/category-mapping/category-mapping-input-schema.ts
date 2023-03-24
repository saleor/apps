import { z } from "zod";

export const SetCategoryMappingInputSchema = z.object({
  categoryId: z.string().min(0),
  googleCategoryId: z.string().optional(),
});

export type SetCategoryMappingInputType = z.infer<typeof SetCategoryMappingInputSchema>;
