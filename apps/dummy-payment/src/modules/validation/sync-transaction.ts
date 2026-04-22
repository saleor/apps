import { z } from "zod";
import { transactionActionsSchema, transactionEventTypeSchema } from "./common";

export const dataSchema = z.object({
  event: z.object({
    type: transactionEventTypeSchema,
    includePspReference: z.boolean().optional().default(true),
  }),
});

export type SyncWebhookRequestData = z.infer<typeof dataSchema>;
