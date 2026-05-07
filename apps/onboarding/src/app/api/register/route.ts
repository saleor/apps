import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next-app-router";

import { saleorApp } from "@/lib/saleor-app";

const handler = createAppRegisterHandler({
  apl: saleorApp.apl,
});

export const POST = handler;
