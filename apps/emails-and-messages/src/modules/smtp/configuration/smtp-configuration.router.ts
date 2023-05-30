import { createLogger } from "@saleor/apps-shared";
import {
  SmtpConfigurationService,
  SmtpConfigurationServiceError,
} from "./smtp-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { z } from "zod";
import { compileMjml } from "../compile-mjml";
import Handlebars from "handlebars";
import { TRPCError } from "@trpc/server";
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
import { SmtpPrivateMetadataManager } from "./smtp-metadata-manager";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { smtpDefaultEmptyConfigurations } from "./smtp-default-empty-configurations";

export const throwTrpcErrorFromConfigurationServiceError = (
  error: SmtpConfigurationServiceError | unknown
) => {
  if (error instanceof SmtpConfigurationServiceError) {
    switch (error.errorType) {
      case "CONFIGURATION_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuration not found",
        });
      case "EVENT_CONFIGURATION_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event configuration not found",
        });
      case "CANT_FETCH":
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't fetch configuration",
        });
    }
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};

/*
 * Allow access only for the dashboard users and attaches the
 * configuration service to the context
 */
const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      configurationService: new SmtpConfigurationService({
        metadataManager: new SmtpPrivateMetadataManager(
          createSettingsManager(ctx.apiClient, ctx.appId!),
          ctx.saleorApiUrl
        ),
      }),
    },
  })
);

export const smtpConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("smtpConfigurationRouter.fetch called");
    return ctx.configurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.get called");

      try {
        return ctx.configurationService.getConfiguration(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getConfigurations called");
      try {
        return ctx.configurationService.getConfigurations(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.create called");
      const newConfiguration = {
        ...smtpDefaultEmptyConfigurations.configuration(),
        ...input,
      };

      console.log(newConfiguration, "this is newConfiguration");
      return await ctx.configurationService.createConfiguration(newConfiguration);
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.delete called");

      try {
        await ctx.configurationService.deleteConfiguration(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getEventConfiguration or create called");

      try {
        return await ctx.configurationService.getEventConfiguration({
          configurationId: input.id,
          eventType: input.eventType,
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.updateEventConfiguration or create called");

      try {
        return await ctx.configurationService.updateEventConfiguration({
          configurationId: input.id,
          eventConfiguration: input,
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
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
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

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
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateBasicInformation called");

      try {
        return await ctx.configurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSmtp: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateSmtpSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateSmtp called");

      try {
        return await ctx.configurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSender: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateSender called");

      try {
        return await ctx.configurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateChannels: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateChannels called");

      try {
        return await ctx.configurationService.updateConfiguration({
          id: input.id,
          channels: {
            override: input.override,
            channels: input.channels,
            mode: input.mode,
          },
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEvent: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateEvent called");

      try {
        return await ctx.configurationService.updateEventConfiguration({
          eventConfiguration: input,
          configurationId: input.id,
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
});
