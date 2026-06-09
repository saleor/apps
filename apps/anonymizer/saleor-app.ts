import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./src/env";

/**
 * Auth data are stored in the file pointed to by `FILE_APL_PATH`
 * (defaults to `.auth-data.json`).
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)
 */
const apl = new FileAPL({ fileName: env.FILE_APL_PATH });

export const saleorApp = new SaleorApp({
  apl,
});
