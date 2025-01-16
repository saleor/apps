import { APL, FileAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./env";
import { BaseError } from "./errors";
import { DynamoAPL } from "./lib/dynamodb-apl";
import { SegmentAPLRepositoryFactory } from "./modules/db/segment-apl-repository-factory";

export let apl: APL;

const MisconfiguredSaleorCloudAPLError = BaseError.subclass("MisconfiguredSaleorCloudAPLError");

switch (env.APL) {
  case "dynamodb": {
    const repository = SegmentAPLRepositoryFactory.create();

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
