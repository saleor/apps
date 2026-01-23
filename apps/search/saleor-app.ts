import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL/saleor-cloud";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./src/env";
import { createLogger } from "./src/lib/logger";
import { dynamoMainTable } from "./src/modules/dynamodb/dynamo-main-table";

const logger = createLogger("saleor-app");

const aplType = env.APL;
let apl: APL;

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

  case "saleor-cloud": {
    if (!env.REST_APL_ENDPOINT || !env.REST_APL_TOKEN) {
      throw new Error("Rest APL is not configured - missing env variables. Check saleor-app.ts");
    }

    apl = new SaleorCloudAPL({
      resourceUrl: env.REST_APL_ENDPOINT,
      token: env.REST_APL_TOKEN,
    });

    break;
  }

  default: {
    throw new Error("Invalid APL config");
  }
}

export const saleorApp = new SaleorApp({
  apl,
});
