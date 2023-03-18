import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { z } from "zod";
import { createSettingsManager } from "../../lib/metadata-manager";
import { createLogger } from "../../lib/logger";
import { MailchimpClientOAuth } from "./mailchimp-client";

// todo remove and use settings manager extracted
const setTokenInput = z.object({
  token: z.string().min(1),
  dc: z.string().min(1).describe("Prefix for mailchimp API"),
});

// todo extract settings manager
const mailchimpaudienceRouter = router({
  getLists: protectedClientProcedure.query(async ({ ctx }) => {
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

    const lists = await mailchimpClient.client.lists.getAllLists();

    logger.debug(lists);

    return lists;
  }),
});

export const MailchimpAudienceRouter = {
  router: mailchimpaudienceRouter,
  input: {},
};
