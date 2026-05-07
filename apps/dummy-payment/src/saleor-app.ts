import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { logger } from "@/lib/logger/logger";
import { APL } from "@saleor/app-sdk/APL";
import { dynamoMainTable } from "@/db/dynamo-main-table";

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */
export let apl: APL;
switch (process.env.APL) {
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
    // Require `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables
    apl = new UpstashAPL();
    break;
  default:
    apl = new FileAPL({
      fileName: process.env.FILE_APL_PATH,
    });
}

export const saleorApp = new SaleorApp({
  apl,
});
