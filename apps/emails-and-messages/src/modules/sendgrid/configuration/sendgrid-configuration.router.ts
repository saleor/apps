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
import { SendgridConfigurationServiceError } from "./sendgrid-configuration.service";
import { router } from "../../trpc/trpc-server";
import { TRPCError } from "@trpc/server";
import { fetchSenders } from "../sendgrid-api";
import { updateChannelsInputSchema } from "../../channels/channel-configuration-schema";
import { sendgridDefaultEmptyConfigurations } from "./sendgrid-default-empty-configurations";
import { protectedWithConfigurationServices } from "../../trpc/protected-client-procedure-with-services";
import { createLogger } from "../../../logger";

export const throwTrpcErrorFromConfigurationServiceError = (
  error: SendgridConfigurationServiceError | unknown,
) => {
  if (error instanceof SendgridConfigurationServiceError) {
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

export const sendgridConfigurationRouter = router({
  fetch: protectedWithConfigurationServices.query(async ({ ctx }) => {
    const logger = createLogger("sendgridConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("sendgridConfigurationRouter.fetch called");
    return ctx.sendgridConfigurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridConfigurationIdInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.get called");
      try {
        return ctx.sendgridConfigurationService.getConfiguration(input);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getConfigurations: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.getConfigurations called");
      try {
        return ctx.sendgridConfigurationService.getConfigurations(input);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  createConfiguration: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridCreateConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.create called");
      const newConfiguration = {
        ...sendgridDefaultEmptyConfigurations.configuration(),
        ...input,
      };

      return await ctx.sendgridConfigurationService.createConfiguration(newConfiguration);
    }),
  deleteConfiguration: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"], updateWebhooks: true })
    .input(sendgridConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.delete called");

      try {
        await ctx.sendgridConfigurationService.deleteConfiguration(input);
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  getEventConfiguration: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.getEventConfiguration called");

      try {
        return await ctx.sendgridConfigurationService.getEventConfiguration({
          configurationId: input.configurationId,
          eventType: input.eventType,
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateBasicInformation: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"], updateWebhooks: true })
    .input(sendgridUpdateBasicInformationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.updateBasicInformation called");

      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateApiConnection: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateApiConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.updateApiConnection called");

      try {
        return await ctx.sendgridConfigurationService.updateConfiguration({ ...input });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateSender: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

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
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
  updateChannels: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

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
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEvent: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"], updateWebhooks: true })
    .input(sendgridUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.updateEvent called");

      const { id: configurationId, eventType, ...eventConfiguration } = input;

      try {
        return await ctx.sendgridConfigurationService.updateEventConfiguration({
          configurationId,
          eventType,
          eventConfiguration,
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),

  updateEventArray: protectedWithConfigurationServices
    .meta({ requiredClientPermissions: ["MANAGE_APPS"], updateWebhooks: true })
    .input(sendgridUpdateEventArraySchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("sendgridConfigurationRouter", {
        saleorApiUrl: ctx.saleorApiUrl,
      });

      logger.debug(input, "sendgridConfigurationRouter.updateEventArray called");

      try {
        const configuration = await ctx.sendgridConfigurationService.getConfiguration({
          id: input.configurationId,
        });

        await ctx.sendgridConfigurationService.updateConfiguration({
          ...configuration,
          events: input.events,
        });
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
});
