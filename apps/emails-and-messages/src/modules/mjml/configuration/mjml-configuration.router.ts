import { PrivateMetadataMjmlConfigurator } from "./mjml-configurator";
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
import { GetMjmlConfigurationService } from "./get-mjml-configuration.service";
import { router } from "../../trpc/trpc-server";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { createSettingsManager } from "../../app-configuration/metadata-manager";
import { z } from "zod";
import { compileMjml } from "../compile-mjml";
import Handlebars from "handlebars";
import { MjmlConfigContainer } from "./mjml-config-container";
import { TRPCError } from "@trpc/server";

export const mjmlConfigurationRouter = router({
  fetch: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("mjmlConfigurationRouter.fetch called");

    return new GetMjmlConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  getConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlGetConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.get called");

      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const configRoot = await mjmlConfigurator.getConfig();
      return MjmlConfigContainer.getConfiguration(configRoot)(input);
    }),
  getConfigurations: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.getConfigurations called");
      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );
      const configRoot = await mjmlConfigurator.getConfig();
      return MjmlConfigContainer.getConfigurations(configRoot)(input);
    }),
  createConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlCreateConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.create called");
      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const configRoot = await mjmlConfigurator.getConfig();
      const newConfigurationRoot = MjmlConfigContainer.createConfiguration(configRoot)(input);

      await mjmlConfigurator.setConfig(newConfigurationRoot);

      return null;
    }),
  deleteConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlDeleteConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.debug(input, "mjmlConfigurationRouter.delete called");
      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const configRoot = await mjmlConfigurator.getConfig();
      const newConfigurationRoot = MjmlConfigContainer.deleteConfiguration(configRoot)(input);

      await mjmlConfigurator.setConfig(newConfigurationRoot);

      return null;
    }),
  updateOrCreateConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlUpdateOrCreateConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.update or create called");

      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const configRoot = await mjmlConfigurator.getConfig();

      const { id } = input;
      if (!!id) {
        const existingConfiguration = MjmlConfigContainer.getConfiguration(configRoot)({ id });
        if (!existingConfiguration) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Configuration not found",
          });
        }
        // checking typeof id is not enough to satisfy typescript, so need to override id field issue
        const configuration = {
          id,
          ...input,
          events: existingConfiguration.events,
        };

        const newConfigurationRoot =
          MjmlConfigContainer.updateConfiguration(configRoot)(configuration);
        await mjmlConfigurator.setConfig(newConfigurationRoot);
        return configuration;
      } else {
        const newConfigurationRoot = MjmlConfigContainer.createConfiguration(configRoot)(input);
        await mjmlConfigurator.setConfig(newConfigurationRoot);
        return newConfigurationRoot.configurations[newConfigurationRoot.configurations.length - 1];
      }
    }),
  getEventConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.getEventConfiguration or create called");

      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const configRoot = await mjmlConfigurator.getConfig();

      const configuration = MjmlConfigContainer.getConfiguration(configRoot)({
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
  updateEventConfiguration: protectedClientProcedure
    .meta({ requiredClientPermissions: ["MANAGE_APPS"] })
    .input(mjmlUpdateEventConfigurationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "mjmlConfigurationRouter.updateEventConfiguration or create called");

      const mjmlConfigurator = new PrivateMetadataMjmlConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const configRoot = await mjmlConfigurator.getConfig();

      const configuration = MjmlConfigContainer.getConfiguration(configRoot)({
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
      const newConfigurationRoot =
        MjmlConfigContainer.updateConfiguration(configRoot)(configuration);
      await mjmlConfigurator.setConfig(newConfigurationRoot);
      return configuration;
    }),

  renderTemplate: protectedClientProcedure
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
