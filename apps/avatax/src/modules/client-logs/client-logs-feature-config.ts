import { z } from "zod";

export const clientLogsFeatureConfig = {
  isEnabled: process.env.FF_ENABLE_EXPERIMENTAL_LOGS,
  dynamoTableName: process.env.DYNAMODB_LOGS_TABLE_NAME,
  ttlInDays: z.number({ coerce: true }).parse(process.env.DYNAMODB_LOGS_ITEM_TTL_IN_DAYS),
};
