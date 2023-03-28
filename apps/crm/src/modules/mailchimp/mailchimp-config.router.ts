import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { createLogger } from "../../lib/logger";
import { MailchimpClientOAuth } from "./mailchimp-client";
import {
  MailchimpConfig,
  MailchimpConfigSettingsManager,
} from "./mailchimp-config-settings-manager";

const setTokenInput = MailchimpConfig;

// todo extract settings manager
const mailchimpConfigRouter = router({
  setToken: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(setTokenInput)
    .mutation(({ ctx, input }) => {
      const logger = createLogger({
        context: "mailchimpConfigRouter",
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.info("Saving Mailchimp token");

      return new MailchimpConfigSettingsManager(ctx.apiClient).setConfig(input);
    }),
  getMailchimpConfigured: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger({
      context: "mailchimpConfigRouter",
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const config = await new MailchimpConfigSettingsManager(ctx.apiClient).getConfig();

    logger.debug(config, "Received config from metadata");

    // todo consider TRPCError?
    if (!config) {
      logger.debug("No config - will return NO_TOKEN");

      return {
        configured: false,
        reason: "NO_TOKEN",
      };
    }

    const mailchimpClient = new MailchimpClientOAuth(config.dc, config.token);

    try {
      logger.debug("Will ping Mailchimp");

      await mailchimpClient.ping();

      logger.debug("Mailchimp seems to be fine");

      return {
        configured: true,
      };
    } catch (e) {
      logger.debug("Ping to mailchimp failed, will return CANT_PING");

      return {
        configured: false,
        reason: "CANT_PING",
      };
    }
  }),
  removeToken: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .mutation(({ ctx }) => {
      return new MailchimpConfigSettingsManager(ctx.apiClient).removeConfig();
    }),
});

export const MailchimpConfigRouter = {
  router: mailchimpConfigRouter,
  input: {
    setToken: setTokenInput,
  },
};
