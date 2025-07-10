import { DynamoAPL } from "@saleor/apl-dynamo";
import { APL } from "@saleor/app-sdk/APL";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL/saleor-cloud";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { appRootTracer } from "@/lib/app-root-tracer";
import { createLogger } from "@/logger";
import { segmentMainTable } from "@/modules/db/segment-main-table";

import { env } from "./env";
import { BaseError } from "./errors";

export let apl: APL;

const MisconfiguredSaleorCloudAPLError = BaseError.subclass("MisconfiguredSaleorCloudAPLError");

switch (env.APL) {
  case "dynamodb": {
    apl = DynamoAPL.create({
      table: segmentMainTable,
      tracer: appRootTracer,
      logger: createLogger("DynamoAPL"),
      env: {
        AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
        AWS_REGION: env.AWS_REGION,
        APL_TABLE_NAME: env.DYNAMODB_MAIN_TABLE_NAME,
        AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
      },
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
