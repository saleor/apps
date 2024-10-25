import { z } from "zod";

import { env } from "@/env";

const schema = z
  .object({
    isEnabled: z.boolean({ coerce: true }).optional().default(false),
    dynamoTableName: z.string().optional(),
    ttlInDays: z
      .number({
        coerce: true,
        errorMap(issue) {
          return { message: "Provide value in days" };
        },
      })
      .optional()
      .default(30),
  })
  .superRefine((values, ctx) => {
    if (values.isEnabled === true) {
      if (!values.dynamoTableName) {
        ctx.addIssue({
          code: "custom",
          message: "When logs are enabled, DYNAMODB_LOGS_TABLE_NAME must be provided",
        });
      }
    } else {
      return;
    }
  });

export const clientLogsFeatureConfig = schema.parse({
  isEnabled: env.FF_ENABLE_EXPERIMENTAL_LOGS,
  dynamoTableName: env.DYNAMODB_LOGS_TABLE_NAME,
  ttlInDays: env.DYNAMODB_LOGS_ITEM_TTL_IN_DAYS,
});
