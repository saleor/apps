import { APL, FileAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { RedisAPL } from "@saleor/app-sdk/APL/redis";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { createClient } from "redis";

import { env } from "./env";
import { BaseError } from "./errors";
import { DynamoAPL } from "./lib/dynamodb-apl";
import { DynamoAPLRepositoryFactory } from "./modules/db/dynamo-apl-repository-factory";

export let apl: APL;

const MisconfiguredSaleorCloudAPLError = BaseError.subclass("MisconfiguredSaleorCloudAPLError");

switch (env.APL) {
  case "dynamodb": {
    const repository = DynamoAPLRepositoryFactory.create();

    apl = new DynamoAPL({ repository });
    break;
  }
  case "saleor-cloud": {
    if (!env.REST_APL_ENDPOINT || !env.REST_APL_TOKEN) {
      throw new MisconfiguredSaleorCloudAPLError(
        "Rest APL is not configured - missing env variables. Check saleor-app.ts",
      );
    }

    apl = new SaleorCloudAPL({
      resourceUrl: env.REST_APL_ENDPOINT,
      token: env.REST_APL_TOKEN,
    });

    break;
  }
  case "redis": {
    if (!env.REDIS_URL) {
      throw new MisconfiguredSaleorCloudAPLError(
        "Redis APL is not configured - missing env variables. Check saleor-app.ts",
      );
    }

    const client = createClient({
      url: env.REDIS_URL,
    });

    apl = new RedisAPL({
      client,
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
