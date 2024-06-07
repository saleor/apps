import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createLogger } from "../../logger";
import { MailchimpClientOAuth } from "./mailchimp-client";
import {
  CustomerCreatedEventConfig,
  MailchimpConfig,
  MailchimpConfigSettingsManager,
} from "./mailchimp-config-settings-manager";

const setTokenInput = MailchimpConfig;

type ConfiguredResponse =
  | {
      configured: false;
      reason: string;
    }
  | {
      configured: true;
      dc: string;
      customerCreateEvent: z.infer<typeof MailchimpConfig>["customerCreateEvent"];
    };

const logger = createLogger("mailchimpConfigRouter");

// todo extract settings manager
const mailchimpConfigRouter = router({
  setToken: protectedClientProcedure.input(setTokenInput).mutation(({ ctx, input }) => {
    logger.info("Saving Mailchimp token", {
      saleorApiUrl: ctx.saleorApiUrl,
    });

    return new MailchimpConfigSettingsManager(ctx.apiClient, ctx.appId!).setConfig(input);
  }),
  setWebhookConfig: protectedClientProcedure
    .input(CustomerCreatedEventConfig)
    .mutation(async ({ ctx, input }) => {
      logger.info("Saving Mailchimp token", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      const mm = new MailchimpConfigSettingsManager(ctx.apiClient, ctx.appId!);

      const currentConfig = await mm.getConfig();

      if (!currentConfig) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      currentConfig.customerCreateEvent = input;

      return mm.setConfig(currentConfig);
    }),
  getMailchimpConfigured: protectedClientProcedure.query(
    async ({ ctx }): Promise<ConfiguredResponse> => {
      const config = await new MailchimpConfigSettingsManager(
        ctx.apiClient,
        ctx.appId!,
      ).getConfig();

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
          dc: config.dc,
        };
      } catch (e) {
        logger.debug("Ping to mailchimp failed, will return CANT_PING");

        return {
          configured: false,
          reason: "CANT_PING",
        };
      }
    },
  ),
  removeToken: protectedClientProcedure.mutation(({ ctx }) => {
    return new MailchimpConfigSettingsManager(ctx.apiClient, ctx.appId!).removeConfig();
  }),
});

export const MailchimpConfigRouter = {
  router: mailchimpConfigRouter,
  input: {
    setToken: setTokenInput,
  },
};
