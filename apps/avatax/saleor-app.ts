import { APL, FileAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { RedisAPL } from "@saleor/app-sdk/APL/redis";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { createClient } from "redis";

import { env } from "@/env";

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */

export let apl: APL;
switch (env.APL) {
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
  case "redis": {
    if (!env.REDIS_URL) {
      throw new Error("Redis APL is not configured - missing env variables. Check saleor-app.ts");
    }

    const client = createClient({
      url: env.REDIS_URL,
    });

    apl = new RedisAPL({
      client,
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
