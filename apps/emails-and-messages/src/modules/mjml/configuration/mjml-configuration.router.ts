import { logger as pinoLogger } from "../../../lib/logger";
import {
  mjmlCreateConfigurationSchema,
  mjmlDeleteConfigurationInputSchema,
  mjmlGetConfigurationInputSchema,
  mjmlGetConfigurationsInputSchema,
  mjmlGetEventConfigurationInputSchema,
  mjmlUpdateEventConfigurationInputSchema,
  mjmlUpdateOrCreateConfigurationSchema,
} from "./mjml-config-input-schema";
import { MjmlConfigurationService } from "./get-mjml-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { z } from "zod";
import { compileMjml } from "../compile-mjml";
import Handlebars from "handlebars";
import { TRPCError } from "@trpc/server";

// Allow access only for the dashboard users and attaches the
// configuration service to the context
const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      ...ctx,
      configurationService: new MjmlConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }),
    },
  })
);

export const mjmlConfigurationRouter = router({
  fetch: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
    logger.debug("mjmlConfigurationRouter.fetch called");
    return ctx.configurationService.getConfigurationRoot();
  }),
  getConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlGetConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.get called");
      return ctx.configurationService.getConfiguration(input);
    }),
  getConfigurations: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.getConfigurations called");
      return ctx.configurationService.getConfigurations(input);
    }),
  createConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlCreateConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.create called");
      return await ctx.configurationService.createConfiguration(input);
    }),
  deleteConfiguration: protectedWithConfigurationService
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlDeleteConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.delete called");
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
    .input(mjmlUpdateOrCreateConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.update or create called");

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
    .input(mjmlGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.getEventConfiguration or create called");

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
    .input(mjmlUpdateEventConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.updateEventConfiguration or create called");

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
});
