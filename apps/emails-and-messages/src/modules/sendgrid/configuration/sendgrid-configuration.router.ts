import { logger as pinoLogger } from "../../../lib/logger";
import {
  sendgridCreateConfigurationSchema,
  sendgridDeleteConfigurationInputSchema,
  sendgridGetConfigurationInputSchema,
  sendgridGetConfigurationsInputSchema,
  sendgridGetEventConfigurationInputSchema,
  sendgridUpdateEventConfigurationInputSchema,
  sendgridUpdateOrCreateConfigurationSchema,
} from "./sendgrid-config-input-schema";
import { SendgridConfigurationService } from "./get-sendgrid-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { TRPCError } from "@trpc/server";

// Allow access only for the dashboard users and attaches the
// configuration service to the context
const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      configurationService: new SendgridConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }),
    },
  })
);

export const sendgridConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
    logger.debug("sendgridConfigurationRouter.fetch called");
    return ctx.configurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "sendgridConfigurationRouter.get called");
      return ctx.configurationService.getConfiguration(input);
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "sendgridConfigurationRouter.getConfigurations called");
      return ctx.configurationService.getConfigurations(input);
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridCreateConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "sendgridConfigurationRouter.create called");
      return await ctx.configurationService.createConfiguration(input);
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridDeleteConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "sendgridConfigurationRouter.delete called");
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
  updateOrCreateConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridUpdateOrCreateConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "sendgridConfigurationRouter.update or create called");

      const { id } = input;
      if (!id) {
        return await ctx.configurationService.createConfiguration(input);
      } else {
        const existingConfiguration = await ctx.configurationService.getConfiguration({ id });
        if (!existingConfiguration) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Configuration not found",
          });
        }
        const configuration = {
          id,
          ...input,
          events: existingConfiguration.events,
        };
        await ctx.configurationService.updateConfiguration(configuration);
        return configuration;
      }
    }),
  getEventConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(sendgridGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.getEventConfiguration or create called");

      const configuration = await ctx.configurationService.getConfiguration({
        id: input.configurationId,
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
    .input(sendgridUpdateEventConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "sendgridConfigurationRouter.updateEventConfiguration or create called");

      const configuration = await ctx.configurationService.getConfiguration({
        id: input.configurationId,
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
      };
      await ctx.configurationService.updateConfiguration(configuration);
      return configuration;
    }),
});
