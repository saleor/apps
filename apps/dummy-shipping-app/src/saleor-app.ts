import { type APL } from "@saleor/app-sdk/APL";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { UpstashAPL } from "@saleor/app-sdk/APL/upstash";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "@/env";

/**
 * By default auth data is stored in `.auth-data.json` (FileAPL), which is fine for local
 * development only. Deployments should use UpstashAPL, which requires `UPSTASH_URL` and
 * `UPSTASH_TOKEN`.
 *
 * https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl
 */
const apl: APL =
  env.APL === "upstash" ? new UpstashAPL() : new FileAPL({ fileName: env.FILE_APL_PATH });

export const saleorApp = new SaleorApp({ apl });
