import { logger as pinoLogger } from "../../../lib/logger";
import { SmtpConfigurationService } from "./get-smtp-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { z } from "zod";
import { compileMjml } from "../compile-mjml";
import Handlebars from "handlebars";
import { TRPCError } from "@trpc/server";
import { getDefaultEmptyConfiguration } from "./smtp-config-container";
import {
  smtpConfigurationIdInputSchema,
  smtpCreateConfigurationInputSchema,
  smtpGetConfigurationsInputSchema,
  smtpGetEventConfigurationInputSchema,
  smtpUpdateBasicInformationSchema,
  smtpUpdateEventConfigurationInputSchema,
  smtpUpdateEventSchema,
  smtpUpdateSenderSchema,
  smtpUpdateSmtpSchema,
} from "./smtp-config-input-schema";
import { updateChannelsInputSchema } from "../../channels/channel-configuration-schema";

/*
 * Allow access only for the dashboard users and attaches the
 * configuration service to the context
 */
const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      configurationService: new SmtpConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }),
    },
  })
);

export const smtpConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("smtpConfigurationRouter.fetch called");
    return ctx.configurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtp.get called");
      return ctx.configurationService.getConfiguration(input);
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getConfigurations called");
      return ctx.configurationService.getConfigurations(input);
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.create called");
      const newConfiguration = {
        ...getDefaultEmptyConfiguration(),
        ...input,
      };

      console.log(newConfiguration, "this is newConfiguration");
      return await ctx.configurationService.createConfiguration(newConfiguration);
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.delete called");
      const existingConfiguration = await ctx.configurationService.getConfiguration(input);

      if (!existingConfiguration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }
      await ctx.configurationService.deleteConfiguration(input);
      return null;
    }),
  getEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getEventConfiguration or create called");

      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }

      const event = configuration.events.find((e) => e.eventType === input.eventType);

      if (!event) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event configuration not found",
        });
      }
      return event;
    }),
  updateEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.updateEventConfiguration or create called");

      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }

      const eventIndex = configuration.events.findIndex((e) => e.eventType === input.eventType);

      configuration.events[eventIndex] = {
        active: input.active,
        eventType: input.eventType,
        template: input.template,
        subject: input.subject,
      };
      await ctx.configurationService.updateConfiguration(configuration);
      return configuration;
    }),

  renderTemplate: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(
      z.object({
        template: z.string().optional(),
        subject: z.string().optional(),
        payload: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.renderTemplate called");

      let renderedSubject = "";

      const payload = JSON.parse(input.payload);

      if (input.subject) {
        const compiledSubjectTemplate = Handlebars.compile(input.subject);

        logger.warn("subject part");
        renderedSubject = compiledSubjectTemplate(payload);
      }

      let renderedEmail = "";

      if (input.template) {
        const compiledSubjectTemplate = Handlebars.compile(input.template);
        const templatedEmail = compiledSubjectTemplate(payload);

        const { html: rawHtml } = compileMjml(templatedEmail);

        if (rawHtml) {
          renderedEmail = rawHtml;
        }
      }

      return {
        renderedSubject,
        renderedEmailBody: renderedEmail,
      };
    }),

  updateBasicInformation: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateBasicInformationSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }

      await ctx.configurationService.updateConfiguration({ ...configuration, ...input });
      return configuration;
    }),

  updateSmtp: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateSmtpSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }

      await ctx.configurationService.updateConfiguration({ ...configuration, ...input });
      return configuration;
    }),

  updateSender: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }

      await ctx.configurationService.updateConfiguration({ ...configuration, ...input });
      return configuration;
    }),

  updateChannels: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }
      configuration.channels = {
        override: input.override,
        channels: input.channels,
        mode: input.mode,
      };
      await ctx.configurationService.updateConfiguration(configuration);
      return configuration;
    }),

  updateEvent: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await ctx.configurationService.getConfiguration({
        id: input.id,
      });

      if (!configuration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration not found",
        });
      }
      const event = configuration.events.find((e) => e.eventType === input.eventType);

      if (!event) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Configuration event not found",
        });
      }

      event.template = input.template;
      event.active = input.active;

      await ctx.configurationService.updateConfiguration(configuration);
      return configuration;
    }),
});
