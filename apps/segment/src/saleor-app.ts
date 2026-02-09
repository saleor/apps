import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { segmentMainTable } from "@/modules/db/segment-main-table";

import { env } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("saleor-app");

export let apl: APL;

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
