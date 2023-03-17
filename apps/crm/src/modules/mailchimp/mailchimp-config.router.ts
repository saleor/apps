import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { z } from "zod";
import { createSettingsManager } from "../../lib/metadata-manager";
import { createLogger } from "../../lib/logger";
import { MailchimpClientOAuth } from "./mailchimp-client";

const setTokenInput = z.object({
  token: z.string().min(1),
  dc: z.string().min(1).describe("Prefix for mailchimp API"),
});

// todo extract settings manager
const mailchimpConfigRouter = router({
  setToken: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(setTokenInput)
    .mutation(({ ctx, input }) => {
      const settingsManager = createSettingsManager(ctx.apiClient);

      const logger = createLogger({
        context: "mailchimpConfigRouter",
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.info("Saving Mailchimp token");

      return settingsManager.set({ key: "mailchimp_config", value: JSON.stringify(input) });
    }),
  getMailchimpConfigured: protectedClientProcedure.query(async ({ ctx }) => {
    const settingsManager = createSettingsManager(ctx.apiClient);

    const logger = createLogger({
      context: "mailchimpConfigRouter",
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const config = await settingsManager.get("mailchimp_config");

    if (!config) {
      return {
        configured: false,
        reason: "NO_TOKEN",
      };
    }

    const parsedConfig = setTokenInput.parse(JSON.parse(config));

    const mailchimpClient = new MailchimpClientOAuth(parsedConfig.dc, parsedConfig.token);

    try {
      await mailchimpClient.ping();

      return {
        configured: true,
      };
    } catch (e) {
      return {
        configured: false,
        reason: "CANT_PING",
      };
    }
  }),
});

export const MailchimpConfigRouter = {
  router: mailchimpConfigRouter,
  input: {
    setToken: setTokenInput,
  },
};
