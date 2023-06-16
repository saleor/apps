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
  smtpUpdateEventActiveStatusInputSchema,
  smtpUpdateEventArraySchema,
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
const protectedWithConfigurationService = protectedClientProcedure.use(
  ({ next, ctx: { authData, apiClient } }) =>
    next({
      ctx: {
        smtpConfigurationService: new SmtpConfigurationService({
          metadataManager: new SmtpPrivateMetadataManager(
            createSettingsManager(apiClient, authData.appId),
            authData.saleorApiUrl
          ),
        }),
      },
    })
);

export const smtpConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx }) => {
    ctx.logger.debug("smtpConfigurationRouter.fetch called");
    return ctx.smtpConfigurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Getting configuration");
      try {
        return ctx.smtpConfigurationService.getConfiguration(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Getting configurations");
      try {
        return ctx.smtpConfigurationService.getConfigurations(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug({ configurationName: input.name }, "Creating a new configuration");
      const newConfiguration = {
        ...smtpDefaultEmptyConfigurations.configuration(),
        ...input,
      };

      return await ctx.smtpConfigurationService.createConfiguration(newConfiguration);
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Delete configuration");

      try {
        await ctx.smtpConfigurationService.deleteConfiguration(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Getting event configuration");

      try {
        return await ctx.smtpConfigurationService.getEventConfiguration({
          configurationId: input.id,
          eventType: input.eventType,
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
      ctx.logger.debug(input, "Rendering submitted MJML template");

      // TODO: Extract rendering to the separate function
      let renderedSubject = "";

      const payload = JSON.parse(input.payload);

      if (input.subject) {
        const compiledSubjectTemplate = Handlebars.compile(input.subject);

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

      ctx.logger.debug("Render successful");

      return {
        renderedSubject,
        renderedEmailBody: renderedEmail,
      };
    }),

  updateBasicInformation: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateBasicInformationSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Updating the configuration");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSmtp: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateSmtpSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug({ configurationId: input.id }, "Updating the configuration");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSender: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Updating the configuration");

      try {
        return await ctx.smtpConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateChannels: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Updating the configuration");

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
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEvent: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Updating the event");

      const { id: configurationId, eventType, ...eventConfiguration } = input;

      try {
        return await ctx.smtpConfigurationService.updateEventConfiguration({
          configurationId,
          eventType,
          eventConfiguration,
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateEventActiveStatus: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventActiveStatusInputSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Updating the event");
      try {
        return await ctx.smtpConfigurationService.updateEventConfiguration({
          configurationId: input.id,
          eventType: input.eventType,
          eventConfiguration: {
            active: input.active,
          },
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateEventArray: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(smtpUpdateEventArraySchema)
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug(input, "Updating events");

      return await Promise.all(
        input.events.map(async (event) => {
          const { eventType, ...eventConfiguration } = event;

          try {
            return await ctx.smtpConfigurationService.updateEventConfiguration({
              configurationId: input.configurationId,
              eventType,
              eventConfiguration,
            });
          } catch (e) {
            throwTrpcErrorFromConfigurationServiceError(e);
          }
        })
      );
    }),
});
