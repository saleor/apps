import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL/saleor-cloud";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { segmentMainTable } from "@/modules/db/segment-main-table";

import { env } from "./env";
import { BaseError } from "./errors";
import { createLogger } from "./logger";

const logger = createLogger("saleor-app");

export let apl: APL;

const MisconfiguredSaleorCloudAPLError = BaseError.subclass("MisconfiguredSaleorCloudAPLError");

switch (env.APL) {
  case "dynamodb": {
    apl = DynamoAPL.create({
      table: segmentMainTable,
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
