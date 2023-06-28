import { createLogger } from "@saleor/apps-shared";
import { router } from "../trpc/trpc-server";
import { protectedWithConfigurationServices } from "../trpc/protected-client-procedure-with-services";

export const appConfigurationRouter = router({
  featureFlags: protectedWithConfigurationServices.query(async ({ ctx }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.featureFlags called");
    return await ctx.featureFlagService.getFeatureFlags();
  }),
});
