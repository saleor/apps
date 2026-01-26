import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { createLogger } from "./logger";
import { dynamoMainTable } from "./modules/dynamodb/dynamo-main-table";

const logger = createLogger("saleor-app");

const aplType = process.env.APL ?? "file";

export let apl: APL;

// TODO introduce t3/env
const validateDynamoEnvVariables = () => {
  const envsSet = [
    "DYNAMODB_MAIN_TABLE_NAME",
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ].every((req) => process.env[req] !== undefined);

  if (!envsSet) {
    throw new Error("Missing required environment variables for DynamoDB APL configuration.");
  }
};

switch (aplType) {
  case "dynamodb": {
    validateDynamoEnvVariables();

    apl = DynamoAPL.create({
      table: dynamoMainTable,
      externalLogger: (message, level) => {
        if (level === "error") {
          logger.error(`[DynamoAPL] ${message}`);
        } else {
          logger.debug(`[DynamoAPL] ${message}`);
        }
      },
    });

    break;
  }

  case "upstash":
    apl = new UpstashAPL();

    break;

  case "file":
    apl = new FileAPL();

    break;

  default: {
    throw new Error("Invalid APL config, ");
  }
}
export const saleorApp = new SaleorApp({
  apl,
});

export const REQUIRED_SALEOR_VERSION = ">=3.11.7 <4";
