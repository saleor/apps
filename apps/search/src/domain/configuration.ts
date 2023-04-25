import { z } from "zod";

export const AppConfigurationSchema = z.object({
  appId: z.string().min(3),
  indexNamePrefix: z.string().optional(),
  secretKey: z.string().min(3),
});

export type AppConfigurationFields = z.infer<typeof AppConfigurationSchema>;
