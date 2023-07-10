import { createLogger } from "@saleor/apps-shared";
import { router } from "../trpc/trpc-server";
import { protectedWithConfigurationServices } from "../trpc/protected-client-procedure-with-services";
import { fetchAppPermissions } from "../../lib/fetch-app-permissions";

export const appConfigurationRouter = router({
  featureFlags: protectedWithConfigurationServices.query(async ({ ctx }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.featureFlags called");
    return await ctx.featureFlagService.getFeatureFlags();
  }),
  appPermissions: protectedWithConfigurationServices.query(async ({ ctx }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.permissions called");
    const appPermissions = await fetchAppPermissions(ctx.apiClient);

    return appPermissions;
  }),
});
