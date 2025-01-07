import { APL, FileAPL, SaleorCloudAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./env";

export let apl: APL;

switch (env.APL) {
  case "file":
    apl = new FileAPL({
      fileName: env.FILE_APL_PATH,
    });

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
