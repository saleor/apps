import { deleteConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/delete-config-trpc-handler";
import { getConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/get-config-trpc-handler";
import { saveConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/save-config-trpc-handler";
import { exportProductsTrpcHandler } from "@/modules/sync/trpc-handlers/export-products-trpc-handler";
import { getChannelsTrpcHandler } from "@/modules/sync/trpc-handlers/get-channels-trpc-handler";
import { importProductsTrpcHandler } from "@/modules/sync/trpc-handlers/import-products-trpc-handler";

import { router } from "./trpc-server";

export const appRouter = router({
  config: router({
    get: getConfigTrpcHandler,
    save: saveConfigTrpcHandler,
    delete: deleteConfigTrpcHandler,
  }),
  sync: router({
    getChannels: getChannelsTrpcHandler,
    importFromShopify: importProductsTrpcHandler,
    exportToShopify: exportProductsTrpcHandler,
  }),
});

export type AppRouter = typeof appRouter;
