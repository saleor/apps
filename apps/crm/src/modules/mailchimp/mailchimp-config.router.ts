import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { z } from "zod";
import { createSettingsManager } from "../../lib/metadata-manager";
import { createLogger } from "../../lib/logger";

const setTokenInput = z.object({
  token: z.string().min(1),
});

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

      settingsManager.set({ key: "mailchimp_api_key", value: input.token });
    }),
});

export const MailchimpConfigRouter = {
  router: mailchimpConfigRouter,
  input: {
    setToken: setTokenInput,
  },
};
