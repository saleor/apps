import { z } from "zod";

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
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.isEnabled === true) {
      if (!values.ttlInDays) {
        ctx.addIssue({
          message: "When logs are enabled, DYNAMODB_LOGS_ITEM_TTL_IN_DAYS must be provided",
          code: "custom",
        });
      }

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
  isEnabled: process.env.FF_ENABLE_EXPERIMENTAL_LOGS,
  dynamoTableName: process.env.DYNAMODB_LOGS_TABLE_NAME,
  ttlInDays: process.env.DYNAMODB_LOGS_ITEM_TTL_IN_DAYS,
});
