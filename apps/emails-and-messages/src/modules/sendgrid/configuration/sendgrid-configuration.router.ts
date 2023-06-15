import { createLogger } from "@saleor/apps-shared";
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
const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      sendgridConfigurationService: new SendgridConfigurationService({
        metadataManager: new SendgridPrivateMetadataManager(
          createSettingsManager(ctx.apiClient, ctx.appId!),
          ctx.saleorApiUrl
        ),
      }),
    },
  })
);

export const sendgridConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("sendgridConfigurationRouter.fetch called");
    return ctx.sendgridConfigurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.get called");
      try {
        return ctx.sendgridConfigurationService.getConfiguration(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.getConfigurations called");
      try {
        return ctx.sendgridConfigurationService.getConfigurations(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.create called");
      const newConfiguration = {
        ...sendgridDefaultEmptyConfigurations.configuration(),
        ...input,
      };

      return await ctx.sendgridConfigurationService.createConfiguration(newConfiguration);
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.delete called");

      try {
        await ctx.sendgridConfigurationService.deleteConfiguration(input);
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.getEventConfiguration called");

      try {
        return await ctx.sendgridConfigurationService.getEventConfiguration({
          configurationId: input.configurationId,
          eventType: input.eventType,
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateBasicInformation: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateBasicInformationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateBasicInformation called");

      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateApiConnection: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateApiConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateApiConnection called");

      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSender: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateBasicInformation called");

      const configuration = await ctx.sendgridConfigurationService.getConfiguration({
        id: input.id,
      });

      // TODO: Discussion - sender validation should be done in the service, or tRPC part?

      // Pull fresh sender data from the API
      const senders = await fetchSenders({ apiKey: configuration.apiKey })();

      const chosenSender = senders.find((s) => s.value === input.sender);

      if (!chosenSender) {
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
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateChannels: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateChannels called");

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
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEvent: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateEvent called");

      const { id: configurationId, eventType, ...eventConfiguration } = input;

      try {
        return await ctx.sendgridConfigurationService.updateEventConfiguration({
          configurationId,
          eventType,
          eventConfiguration,
        });
      } catch (e) {
        throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEventArray: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateEventArraySchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateEventArray called");

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
            throwTrpcErrorFromConfigurationServiceError(e);
          }
        })
      );
    }),
});
