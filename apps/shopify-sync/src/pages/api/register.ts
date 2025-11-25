import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "@/lib/saleor-app";

export default createAppRegisterHandler({
  apl: saleorApp.apl,
  allowedSaleorUrls: [(_saleorApiUrl: string) => true],
});
