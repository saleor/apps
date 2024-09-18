import { z } from "zod";

export const clientLogsFeatureConfig = {
  isEnabled: z.boolean({ coerce: true }).parse(process.env.FF_ENABLE_EXPERIMENTAL_LOGS),
  dynamoTableName: z.string().parse(process.env.DYNAMODB_LOGS_TABLE_NAME),
  ttlInDays: z
    .number({
      coerce: true,
      errorMap(issue) {
        return { message: "Provide value in days" };
      },
    })
    .parse(process.env.DYNAMODB_LOGS_ITEM_TTL_IN_DAYS),
};
