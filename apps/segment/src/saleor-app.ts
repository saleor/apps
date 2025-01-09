import { APL, FileAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./env";
import { BaseError } from "./errors";
import { DynamoDBApl } from "./lib/dynamodb/dynamodb-apl";
import { documentClient } from "./lib/dynamodb/segment-config-table";

export let apl: APL;

const MisconfiguredSaleorCloudAPLError = BaseError.subclass("MisconfiguredSaleorCloudAPLError");
const MisconfiguredDynamoDBAPLError = BaseError.subclass("MisconfiguredDynamoDBAPLError");

switch (env.APL) {
  case "dynamodb": {
    if (!env.DYNAMODB_CONFIG_TABLE_NAME) {
      throw new MisconfiguredDynamoDBAPLError(
        "DynamoDB APL is not configured - missing env variables. Check saleor-app.ts",
      );
    }

    apl = new DynamoDBApl({
      // todo: maybe import from lib/dynamodb/dynamodb-client.ts inside APL
      documentClient: documentClient,
      tableName: env.DYNAMODB_CONFIG_TABLE_NAME,
      appManifestId: env.MANIFEST_APP_ID,
    });

    break;
  }

  case "saleor-cloud": {
    if (!env.REST_APL_ENDPOINT || !env.REST_APL_TOKEN) {
      throw new MisconfiguredSaleorCloudAPLError(
        "Rest APL is not configured - missing env variables. Check saleor-app.ts",
      );
    }

    apl = new SaleorCloudAPL({
      resourceUrl: env.REST_APL_ENDPOINT,
      token: env.REST_APL_TOKEN,
    });

    break;
  }

  case "file":
  default:
    apl = new FileAPL({
      fileName: env.FILE_APL_PATH,
    });

    break;
}

export const saleorApp = new SaleorApp({
  apl,
});
