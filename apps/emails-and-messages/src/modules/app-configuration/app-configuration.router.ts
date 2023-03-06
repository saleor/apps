import { PrivateMetadataAppConfigurator } from "./app-configurator";
import { createSettingsManager } from "./metadata-manager";
import { logger as pinoLogger } from "../../lib/logger";
import { appConfigInputSchema } from "./app-config-input-schema";
import { GetAppConfigurationService } from "./get-app-configuration.service";
import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

export const appConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("appConfigurationRouter.fetch called");

    return new GetAppConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  setAndReplace: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(appConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "appConfigurationRouter.setAndReplace called with input");

      const appConfigurator = new PrivateMetadataAppConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      await appConfigurator.setConfig(input);

      return null;
    }),
});
