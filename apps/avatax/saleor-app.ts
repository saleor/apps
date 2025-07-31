import { APL } from "@saleor/app-sdk/APL";
import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorCloudAPL } from "@saleor/app-sdk/APL/saleor-cloud";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "@/env";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

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
      env: {
        APL_TABLE_NAME: env.DYNAMODB_MAIN_TABLE_NAME,
        AWS_REGION: env.AWS_REGION,
        AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
      },
      table: dynamoMainTable,
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
