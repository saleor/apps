import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./env";

export const saleorApp = new SaleorApp({
  apl: env.APL === "file" ? undefined : env.APL,
});
