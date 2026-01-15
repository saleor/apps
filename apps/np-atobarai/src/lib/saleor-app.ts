import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import * as Sentry from "@sentry/nextjs";

import { createLogger } from "@/lib/logger";
import { dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

import { env } from "./env";

export let apl: APL;
switch (env.APL) {
  case "dynamodb": {
    apl = DynamoAPL.create({
      table: dynamoMainTable,
      externalLogger(message, level) {
        const logger = createLogger("DynamoAPL");

        if (level === "error") {
          logger.error(message);
          Sentry.captureException(message);
        } else {
          logger.debug(message);
        }
      },
    });

    break;
  }

  default: {
    apl = new FileAPL();
    break;
  }
}

export const saleorApp = new SaleorApp({
  apl,
});
