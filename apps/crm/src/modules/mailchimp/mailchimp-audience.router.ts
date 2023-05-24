import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

import { MailchimpClientOAuth } from "./mailchimp-client";
import { MailchimpConfigSettingsManager } from "./mailchimp-config-settings-manager";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createLogger } from "@saleor/apps-shared";

const AddContactSchema = z.object({
  listId: z.string().min(1),
  contact: z.object({
    email: z.string().email().min(2),
  }),
});

const BulkAddContactsSchema = z.object({
  contacts: z.array(
    z.object({
      email: z.string().email().min(2),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
  ),
  listId: z.string().min(1),
});

const mailchimpAudienceRouter = router({
  getLists: protectedClientProcedure.query(async ({ ctx }) => {
    const config = await new MailchimpConfigSettingsManager(ctx.apiClient, ctx.appId!).getConfig();

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

    const listsResponseOrError = await mailchimpClient.fetchLists();

    logger.trace(listsResponseOrError, "Fetched lists");

    if ("lists" in listsResponseOrError) {
      return listsResponseOrError.lists.map((l) => ({
        id: l.id,
        name: l.name,
        members: l.stats.member_count,
      }));
    }

    throw new Error("Failed fetching lists from Mailchimp");
  }),
  bulkAddContacts: protectedClientProcedure
    .input(BulkAddContactsSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        context: "mailchimpConfigRouter.bulkAddContacts",
        saleorApiUrl: ctx.saleorApiUrl,
      });

      const config = await new MailchimpConfigSettingsManager(
        ctx.apiClient,
        ctx.appId!
      ).getConfig();

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

      logger.debug(input, "Will bulk add contacts to Mailchimp");

      await mailchimpClient.batchAddContacts(input.listId, input.contacts);
    }),
});

export const MailchimpAudienceRouter = {
  router: mailchimpAudienceRouter,
  input: {
    AddContactSchema,
  },
};
