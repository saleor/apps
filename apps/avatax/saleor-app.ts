import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL/saleor-cloud";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "@/env";
import { createLogger } from "@/logger";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

const logger = createLogger("saleor-app");

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)
 */

export let apl: APL;

switch (env.APL) {
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

  // todo: deprecate in sdk, remove in apps, clean envs
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
    apl = new FileAPL({
      fileName: env.FILE_APL_PATH,
    });
    break;
  }
}

export const saleorApp = new SaleorApp({
  apl,
});
