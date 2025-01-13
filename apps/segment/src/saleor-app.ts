import { APL, FileAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./env";
import { BaseError } from "./errors";
import { DynamoAPL } from "./lib/dynamodb-apl";
import {
  documentClient,
  SegmentMainTable,
  SegmentMainTableEntityFactory,
} from "./modules/db/segment-main-table";

export let apl: APL;

const MisconfiguredSaleorCloudAPLError = BaseError.subclass("MisconfiguredSaleorCloudAPLError");
const MisconfiguredDynamoAPLError = BaseError.subclass("MisconfiguredDynamoAPLError");

switch (env.APL) {
  case "dynamodb": {
    if (
      !env.DYNAMODB_MAIN_TABLE_NAME ||
      !env.AWS_REGION ||
      !env.AWS_ACCESS_KEY_ID ||
      !env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new MisconfiguredDynamoAPLError(
        "DynamoDB APL is not configured - missing env variables. Check saleor-app.ts",
      );
    }

    // TODO: when we have config in DyanamoDB - move to `segment-main-table.ts`
    const table = SegmentMainTable.create({
      tableName: env.DYNAMODB_MAIN_TABLE_NAME,
      documentClient,
    });
    const segmentAPLEntity = SegmentMainTableEntityFactory.createAPLEntity(table);

    apl = new DynamoAPL({ segmentAPLEntity });
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
