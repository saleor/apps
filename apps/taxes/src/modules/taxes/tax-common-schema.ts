import { z } from "zod";

export const addressSchema = z.object({
  country: z.string(),
  zip: z.string(),
  state: z.string(),
  city: z.string(),
  street: z.string(),
});
