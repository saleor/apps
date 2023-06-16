import {
  sendgridConfigurationIdInputSchema,
  sendgridCreateConfigurationInputSchema,
  sendgridGetConfigurationsInputSchema,
  sendgridGetEventConfigurationInputSchema,
  sendgridUpdateApiConnectionSchema,
  sendgridUpdateBasicInformationSchema,
  sendgridUpdateEventArraySchema,
  sendgridUpdateEventSchema,
  sendgridUpdateSenderSchema,
} from "./sendgrid-config-input-schema";
import {
  SendgridConfigurationService,
  SendgridConfigurationServiceError,
} from "./sendgrid-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { TRPCError } from "@trpc/server";
import { fetchSenders } from "../sendgrid-api";
import { updateChannelsInputSchema } from "../../channels/channel-configuration-schema";
import { SendgridPrivateMetadataManager } from "./sendgrid-metadata-manager";
import { createSettingsManager } from "../../../lib/metadata-manager";
import { sendgridDefaultEmptyConfigurations } from "./sendgrid-default-empty-configurations";

export const throwTrpcErrorFromConfigurationServiceError = (
  error: SendgridConfigurationServiceError | unknown
) => {
  if (error instanceof SendgridConfigurationServiceError) {
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
        sendgridConfigurationService: new SendgridConfigurationService({
          metadataManager: new SendgridPrivateMetadataManager(
            createSettingsManager(apiClient, authData.appId),
            authData.saleorApiUrl
          ),
        }),
      },
    })
);

export const sendgridConfigurationRouter = router({
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      ctx.logger.debug(`Getting configuration ${input.id} from configuration service`);
      try {
        return await ctx.sendgridConfigurationService.getConfiguration(input);
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.sendgridConfigurationService.getConfigurations(input);
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const newConfiguration = {
        ...sendgridDefaultEmptyConfigurations.configuration(),
        ...input,
      };

      try {
        return await ctx.sendgridConfigurationService.createConfiguration(newConfiguration);
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.sendgridConfigurationService.deleteConfiguration(input);
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.sendgridConfigurationService.getEventConfiguration({
          configurationId: input.configurationId,
          eventType: input.eventType,
        });
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateBasicInformation: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateBasicInformationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateApiConnection: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateApiConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSender: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const configuration = await ctx.sendgridConfigurationService.getConfiguration({
        id: input.id,
      });

      // TODO: Discussion - sender validation should be done in the service, or tRPC part?

      // Pull fresh sender data from the API
      const senders = await fetchSenders({ apiKey: configuration.apiKey })();

      const chosenSender = senders.find((s) => s.value === input.sender);

      if (!chosenSender) {
        ctx.logger.debug({ input }, "Throwing error - sender does not exist");
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Sender does not exist",
        });
      }

      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({
          id: input.id,
          senderEmail: chosenSender.from_email,
          senderName: chosenSender.label,
          sender: input.sender,
        });
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateChannels: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({
          id: input.id,
          channels: {
            override: input.override,
            channels: input.channels,
            mode: input.mode,
          },
        });
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEvent: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: configurationId, eventType, ...eventConfiguration } = input;

      try {
        return await ctx.sendgridConfigurationService.updateEventConfiguration({
          configurationId,
          eventType,
          eventConfiguration,
        });
      } catch (e) {
        ctx.logger.debug({ error: e }, `Service has thrown an error`);
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEventArray: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateEventArraySchema)
    .mutation(async ({ ctx, input }) => {
      return await Promise.all(
        input.events.map(async (event) => {
          const { eventType, ...eventConfiguration } = event;

          try {
            return await ctx.sendgridConfigurationService.updateEventConfiguration({
              configurationId: input.configurationId,
              eventType,
              eventConfiguration,
            });
          } catch (e) {
            ctx.logger.debug({ error: e }, `Service has thrown an error`);
            throwTrpcErrorFromConfigurationServiceError(e);
          }
        })
      );
    }),
});
