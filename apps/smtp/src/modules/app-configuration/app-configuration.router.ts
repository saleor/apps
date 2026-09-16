import { fetchAppPermissions } from "../../lib/fetch-app-permissions";
import { createLogger } from "../../logger";
import { protectedWithConfigurationServices } from "../trpc/protected-client-procedure-with-services";
import { router } from "../trpc/trpc-server";

export const appConfigurationRouter = router({
  appPermissions: protectedWithConfigurationServices.query(async ({ ctx }) => {
    const logger = createLogger("appConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.permissions called");
    const appPermissions = await fetchAppPermissions(ctx.apiClient);

    return appPermissions;
  }),
});
