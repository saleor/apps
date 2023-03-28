import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { createLogger } from "../../lib/logger";
import { MailchimpClientOAuth } from "./mailchimp-client";
import {
  MailchimpConfig,
  MailchimpConfigSettingsManager,
  CustomerCreatedEventConfig,
} from "./mailchimp-config-settings-manager";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const setTokenInput = MailchimpConfig;

type ConfiguredResponse =
  | {
      configured: false;
      reason: string;
    }
  | {
      configured: true;
      customerCreateEvent: z.infer<typeof MailchimpConfig>["customerCreateEvent"];
    };

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
  setWebhookConfig: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(CustomerCreatedEventConfig)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        context: "mailchimpConfigRouter",
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.info("Saving Mailchimp token");

      const mm = new MailchimpConfigSettingsManager(ctx.apiClient);

      const currentConfig = await mm.getConfig();

      if (!currentConfig) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      currentConfig.customerCreateEvent = input;

      return mm.setConfig(currentConfig);
    }),
  getMailchimpConfigured: protectedClientProcedure.query(
    async ({ ctx }): Promise<ConfiguredResponse> => {
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
          customerCreateEvent: config.customerCreateEvent,
        };
      } catch (e) {
        logger.debug("Ping to mailchimp failed, will return CANT_PING");

        return {
          configured: false,
          reason: "CANT_PING",
        };
      }
    }
  ),
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
