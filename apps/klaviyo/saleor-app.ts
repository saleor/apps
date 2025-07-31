import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL/saleor-cloud";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { dynamoMainTable } from "./src/dynamodb/dynamo-main-table";

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)
 */
const aplType = process.env.APL ?? "file";
let apl: APL;

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
      env: {
        APL_TABLE_NAME: process.env.DYNAMODB_MAIN_TABLE_NAME as string,
        AWS_REGION: process.env.AWS_REGION as string,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
      table: dynamoMainTable,
    });

    break;
  }

  case "upstash":
    apl = new UpstashAPL();

    break;

  case "file":
    apl = new FileAPL();

    break;

  case "saleor-cloud": {
    if (!process.env.REST_APL_ENDPOINT || !process.env.REST_APL_TOKEN) {
      throw new Error("Rest APL is not configured - missing env variables. Check saleor-app.ts");
    }

    apl = new SaleorCloudAPL({
      resourceUrl: process.env.REST_APL_ENDPOINT,
      token: process.env.REST_APL_TOKEN,
    });

    break;
  }

  default: {
    throw new Error("Invalid APL config, ");
  }
}

if (!process.env.SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "For production deployment SECRET_KEY is mandatory to use EncryptedSettingsManager.",
  );
}

// Use placeholder value for the development
export const settingsManagerSecretKey = process.env.SECRET_KEY || "CHANGE_ME";

export const saleorApp = new SaleorApp({
  apl,
});
