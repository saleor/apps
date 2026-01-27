import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "@/env";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

import { createLogger } from "./logger";

const logger = createLogger("saleor-app");

const aplType = env.APL;

export let apl: APL;

switch (aplType) {
  case "dynamodb": {
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
