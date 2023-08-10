import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "./app-config-metadata-manager";
import { RootConfig } from "./schemas/root-config.schema";

export const configurationRouter = router({
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const manager = AppConfigMetadataManager.createFromAuthData({
      appId: ctx.appId,
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const config = await manager.get();

    return config.getConfig();
  }),
  setConfig: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(z.string().min(1))
    .mutation(async ({ input, ctx }) => {
      const manager = AppConfigMetadataManager.createFromAuthData({
        appId: ctx.appId,
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken,
      });

      const config = await manager.get();

      config.setSegmentWriteKey(input);

      await manager.set(config);
    }),
});
