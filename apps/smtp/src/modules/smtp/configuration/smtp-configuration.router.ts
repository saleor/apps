import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createLogger } from "../../../logger";
import { updateChannelsInputSchema } from "../../channels/channel-configuration-schema";
import { protectedWithConfigurationServices } from "../../trpc/protected-client-procedure-with-services";
import { router } from "../../trpc/trpc-server";
import { EmailCompiler } from "../services/email-compiler";
import { HandlebarsTemplateCompiler } from "../services/handlebars-template-compiler";
import { HtmlToTextCompiler } from "../services/html-to-text-compiler";
import { MjmlCompiler } from "../services/mjml-compiler";
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
import { SmtpConfigurationService } from "./smtp-configuration.service";
import { smtpDefaultEmptyConfigurations } from "./smtp-default-empty-configurations";

export const throwTrpcErrorFromConfigurationServiceError = (
  error: typeof SmtpConfigurationService.SmtpConfigurationServiceError | unknown,
) => {
  createLogger("trpcError").debug("Error from TRPC", { error });

  if (error instanceof SmtpConfigurationService.SmtpConfigurationServiceError) {
    switch (error["constructor"]) {
      case SmtpConfigurationService.ConfigNotFoundError:
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuration not found.",
        });

      case SmtpConfigurationService.EventConfigNotFoundError:
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event configuration not found.",
        });

      case SmtpConfigurationService.CantFetchConfigError:
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't fetch configuration.",
        });

      case SmtpConfigurationService.WrongSaleorVersionError:
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Feature you are trying to use is not supported in this version of Saleor.",
        });

      case SmtpConfigurationService.TemplateValidationError:
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
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

      return ctx.smtpConfigurationService.getConfiguration(input).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
    }),
  getConfigurations: protectedWithConfigurationServices
    .input(smtpGetConfigurationsInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getConfigurations called");

      return ctx.smtpConfigurationService.getConfigurations(input).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
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

      return await ctx.smtpConfigurationService.createConfiguration(newConfiguration).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
    }),
  deleteConfiguration: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpConfigurationIdInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.delete called");

      await ctx.smtpConfigurationService.deleteConfiguration(input).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
    }),
  getEventConfiguration: protectedWithConfigurationServices
    .input(smtpGetEventConfigurationInputSchema)
    .query(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.getEventConfiguration or create called");

      return await ctx.smtpConfigurationService
        .getEventConfiguration({
          configurationId: input.id,
          eventType: input.eventType,
        })
        .match(
          (v) => v,
          (e) => throwTrpcErrorFromConfigurationServiceError(e),
        );
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

      const payload = JSON.parse(input.payload);

      // Validate templates using EmailCompiler
      const emailCompiler = new EmailCompiler(
        new HandlebarsTemplateCompiler(),
        new HtmlToTextCompiler(),
        new MjmlCompiler(),
      );

      const validationResult = emailCompiler.validate(
        input.subject || "",
        input.template || "",
        payload,
      );

      if (validationResult.isErr()) {
        logger.info("Invalid template provided by user", { error: validationResult.error });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validationResult.error.message,
          cause: validationResult.error,
        });
      }

      // If validation passes, compile and render
      let renderedSubject = "";
      let renderedEmail = "";

      if (input.subject) {
        const handlebarsCompiler = new HandlebarsTemplateCompiler();
        const subjectResult = handlebarsCompiler.compile(input.subject, payload);

        if (subjectResult.isOk()) {
          renderedSubject = subjectResult.value.template;
        }
      }

      if (input.template) {
        const handlebarsCompiler = new HandlebarsTemplateCompiler();
        const templateResult = handlebarsCompiler.compile(input.template, payload);

        if (templateResult.isOk()) {
          const mjmlCompiler = new MjmlCompiler();
          const compilationResult = mjmlCompiler.compile(templateResult.value.template);

          if (compilationResult.isOk()) {
            renderedEmail = compilationResult.value;
          }
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

      return await ctx.smtpConfigurationService.updateConfiguration({ ...input }).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
    }),

  updateSmtp: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpUpdateSmtpSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateSmtp called");

      return await ctx.smtpConfigurationService.updateConfiguration({ ...input }).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
    }),

  updateSender: protectedWithConfigurationServices
    .input(smtpUpdateSenderSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateSender called");

      return await ctx.smtpConfigurationService.updateConfiguration({ ...input }).match(
        (v) => v,
        (e) => throwTrpcErrorFromConfigurationServiceError(e),
      );
    }),

  updateChannels: protectedWithConfigurationServices
    .input(updateChannelsInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateChannels called");

      return await ctx.smtpConfigurationService
        .updateConfiguration({
          id: input.id,
          channels: {
            override: input.override,
            channels: input.channels,
            mode: input.mode,
          },
        })
        .match(
          (v) => v,
          (e) => throwTrpcErrorFromConfigurationServiceError(e),
        );
    }),

  updateEvent: protectedWithConfigurationServices
    .meta({ updateWebhooks: true })
    .input(smtpUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("smtpConfigurationRouter", { saleorApiUrl: ctx.saleorApiUrl });

      logger.debug(input, "smtpConfigurationRouter.updateEvent called");

      const { id: configurationId, eventType, ...eventConfiguration } = input;

      return await ctx.smtpConfigurationService
        .updateEventConfiguration({
          configurationId,
          eventType,
          eventConfiguration,
        })
        .match(
          (v) => v,
          (e) => throwTrpcErrorFromConfigurationServiceError(e),
        );
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

        if (configuration.isErr()) {
          throwTrpcErrorFromConfigurationServiceError(configuration.error);

          return;
        }

        await ctx.smtpConfigurationService
          .updateConfiguration({
            ...configuration.value,
            events: input.events,
          })
          .match(
            (v) => v,
            (e) => throwTrpcErrorFromConfigurationServiceError(e),
          );
      } catch (e) {
        return throwTrpcErrorFromConfigurationServiceError(e);
      }
    }),
});
