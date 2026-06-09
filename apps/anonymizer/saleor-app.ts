import type { APL } from "@saleor/app-sdk/APL";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./src/env";

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)
 */
let apl: APL;

switch (env.APL) {
  case "upstash":
    // Requires `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables
    apl = new UpstashAPL();

    break;

  case "file":
    apl = new FileAPL({ fileName: env.FILE_APL_PATH });

    break;

  default: {
    throw new Error("Invalid APL config");
  }
}

export const saleorApp = new SaleorApp({
  apl,
});
