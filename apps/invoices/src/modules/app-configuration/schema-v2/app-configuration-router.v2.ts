import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";

import { createSettingsManager } from "../metadata-manager";
import { createLogger } from "@saleor/apps-shared";
import { GetAppConfigurationV2Service } from "./get-app-configuration.v2.service";

export const appConfigurationRouterV2 = router({
  fetchChannelsOverrides: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouterV2.fetch called");

    const appConfig = await new GetAppConfigurationV2Service(ctx).getConfiguration();

    return appConfig.getChannelsOverrides();
  }),
  /*
   * setAndReplace: protectedClientProcedure
   *   .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
   *   .input(appConfigInputSchema)
   *   .mutation(async ({ ctx, input }) => {
   *     const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });
   * 
   *     logger.debug(input, "appConfigurationRouterV2.setAndReplace called with input");
   * 
   *     const appConfigurator = new PrivateMetadataAppConfigurator(
   *       createSettingsManager(ctx.apiClient),
   *       ctx.saleorApiUrl
   *     );
   * 
   *     await appConfigurator.setConfig(input);
   * 
   *     return null;
   *   }),
   */
});
