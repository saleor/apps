import { PrivateMetadataSendgridConfigurator } from "./sendgrid-configurator";
import { logger as pinoLogger } from "../../../lib/logger";
import { sendgridConfigInputSchema } from "./sendgrid-config-input-schema";
import { GetSendgridConfigurationService } from "./get-sendgrid-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { createSettingsManager } from "../../app-configuration/metadata-manager";

export const sendgridConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("sendgridConfigurationRouter.fetch called");

    return new GetSendgridConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  setAndReplace: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridConfigInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.setAndReplace called with input");

      const sendgridConfigurator = new PrivateMetadataSendgridConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      await sendgridConfigurator.setConfig(input);

      return null;
    }),
});
