import { DynamoAPL } from "@saleor/apl-dynamo";
import { APL } from "@saleor/app-sdk/APL";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { createLogger } from "@/lib/logger";
import { appInternalTracer } from "@/lib/tracing";
import { dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

import { env } from "./env";

export let apl: APL;
switch (env.APL) {
  case "dynamodb": {
    apl = DynamoAPL.create({
      table: dynamoMainTable,
      tracer: appInternalTracer,
      logger: createLogger("DynamoAPL"),
      env: {
        APL_TABLE_NAME: env.DYNAMODB_MAIN_TABLE_NAME,
        AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
        AWS_REGION: env.AWS_REGION,
        AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
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
