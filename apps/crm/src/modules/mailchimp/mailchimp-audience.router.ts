import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { createLogger } from "../../lib/logger";
import { MailchimpClientOAuth } from "./mailchimp-client";
import { MailchimpConfigSettingsManager } from "./mailchimp-config-settings-manager";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const AddContactSchema = z.object({
  listId: z.string().min(1),
  contact: z.object({
    email: z.string().min(2),
  }),
});

const mailchimpAudienceRouter = router({
  getLists: protectedClientProcedure.query(async ({ ctx }) => {
    const config = await new MailchimpConfigSettingsManager(ctx.apiClient).getConfig();

    /**
     * TODO extract mailchimp API readiness shared class
     */
    if (!config) {
      throw new TRPCError({
        code: "FORBIDDEN",
        cause: "MAILCHIMP_CONFIG_NOT_FOUND",
        message: "Couldnt restore saved Mailchimp config",
      });
    }

    const logger = createLogger({
      context: "mailchimpConfigRouter",
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const mailchimpClient = new MailchimpClientOAuth(config.dc, config.token);

    const listsResponseOrError = await mailchimpClient.client.lists.getAllLists();

    logger.trace(listsResponseOrError, "Fetched lists");

    if ("lists" in listsResponseOrError) {
      return listsResponseOrError.lists.map((l) => ({
        id: l.id,
        name: l.name,
      }));
    }

    throw new Error("Failed fetching lists from Mailchimp");
  }),
  addContact: protectedClientProcedure.input(AddContactSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      context: "mailchimpConfigRouter",
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const config = await new MailchimpConfigSettingsManager(ctx.apiClient).getConfig();

    logger.debug("Fetched config from metadata");

    if (!config) {
      logger.warn("Config not found");

      throw new TRPCError({
        code: "FORBIDDEN",
        cause: "MAILCHIMP_CONFIG_NOT_FOUND",
        message: "Couldnt restore saved Mailchimp config",
      });
    }

    const mailchimpClient = new MailchimpClientOAuth(config.dc, config.token);

    logger.debug(input, "Will add contact to Mailchimp");

    return mailchimpClient.addContact(input.listId, input.contact.email);
  }),
});

export const MailchimpAudienceRouter = {
  router: mailchimpAudienceRouter,
  input: {
    AddContactSchema,
  },
};
