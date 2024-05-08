import { SmtpConfigurationServiceError } from "./smtp-configuration.service";
import { router } from "../../trpc/trpc-server";
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
  smtpUpdateEventArraySchema,
  smtpUpdateEventSchema,
  smtpUpdateSenderSchema,
  smtpUpdateSmtpSchema,
} from "./smtp-config-input-schema";
import { updateChannelsInputSchema } from "../../channels/channel-configuration-schema";
import { protectedWithConfigurationServices } from "../../trpc/protected-client-procedure-with-services";
import { smtpDefaultEmptyConfigurations } from "./smtp-default-empty-configurations";
import { createLogger } from "../../../logger";

export const throwTrpcErrorFromConfigurationServiceError = (
  error: SmtpConfigurationServiceError | unknown,
) => {
  if (error instanceof SmtpConfigurationServiceError) {
    switch (error.errorType) {
      case "CONFIGURATION_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuration not found.",
        });
      case "EVENT_CONFIGURATION_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event configuration not found.",
        });
      case "CANT_FETCH":
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't fetch configuration.",
        });
      case "WRONG_SALEOR_VERSION":
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Feature you are trying to use is not supported in this version of Saleor.",
        });
    }
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};

export const smtpConfigurationRouter = router({
  fetch: protectedWithConfigurationServices.query(async ({ ctx }) => {
    const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("smtpConfigurationRouter.fetch called");
    return ctx.smtpConfigurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationServices
    .input(smtpConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.get called");

      try {
        return ctx.smtpConfigurationService.getConfiguration(input);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getConfigurations: protectedWithConfigurationServices
    .input(smtpGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getConfigurations called");
      try {
        return ctx.smtpConfigurationService.getConfigurations(input);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  createConfiguration: protectedWithConfigurationServices
    .input(smtpCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.create called");
      const newConfiguration = {
        ...smtpDefaultEmptyConfigurations.configuration(),
        ...input,
      };

      try {
        return await ctx.smtpConfigurationService.createConfiguration(newConfiguration);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  deleteConfiguration: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.delete called");

      try {
        await ctx.smtpConfigurationService.deleteConfiguration(input);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getEventConfiguration: protectedWithConfigurationServices
    .input(smtpGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getEventConfiguration or create called");

      try {
        return await ctx.smtpConfigurationService.getEventConfiguration({
          configurationId: input.id,
          eventType: input.eventType,
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  renderTemplate: protectedWithConfigurationServices
    .input(
      z.object({
        template: z.string().optional(),
        subject: z.string().optional(),
        payload: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

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

  updateBasicInformation: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpUpdateBasicInformationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateBasicInformation called");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSmtp: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpUpdateSmtpSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateSmtp called");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSender: protectedWithConfigurationServices
    .input(smtpUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateSender called");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateChannels: protectedWithConfigurationServices
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateChannels called");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({
          id: input.id,
          channels: {
            override: input.override,
            channels: input.channels,
            mode: input.mode,
          },
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEvent: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateEvent called");

      const { id: configurationId, eventType, ...eventConfiguration } = input;

      try {
        return await ctx.smtpConfigurationService.updateEventConfiguration({
          configurationId,
          eventType,
          eventConfiguration,
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateEventArray: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpUpdateEventArraySchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateEventArray called");

      try {
        const configuration = await ctx.smtpConfigurationService.getConfiguration({
          id: input.configurationId,
        });

        await ctx.smtpConfigurationService.updateConfiguration({
          ...configuration,
          events: input.events,
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
});
