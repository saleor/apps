import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

import { env } from "./env";

export let apl: APL;
switch (env.APL) {
  case "dynamodb": {
    apl = DynamoAPL.create({
      table: dynamoMainTable,
    });

    break;
  }

  default: {
    // Use /tmp directory for serverless environments where filesystem is read-only
    const fileName = env.NODE_ENV === "production" ? "/tmp/.auth-data.json" : undefined;

    apl = new FileAPL({ fileName });
    break;
  }
}

export const saleorApp = new SaleorApp({
  apl,
});
