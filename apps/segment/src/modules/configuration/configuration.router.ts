import { createLogger } from "@/logger";
import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { AppConfigMetadataManager } from "./app-config-metadata-manager";

const logger = createLogger("configurationRouter");

export const configurationRouter = router({
  getConfig: protectedClientProcedure.query(async ({ ctx }) => {
    const manager = AppConfigMetadataManager.createFromAuthData({
      appId: ctx.appId,
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const config = await manager.get();

    logger.info("Fetched config");

    return config.getConfig();
  }),
  setConfig: protectedClientProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    logger.info("Request to set config");

    const manager = AppConfigMetadataManager.createFromAuthData({
      appId: ctx.appId,
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    const config = await manager.get();

    config.setSegmentWriteKey(input);

    await manager.set(config);

    logger.info("Config set successfully");
  }),
});
