import { TRPCError } from "@trpc/server";
import { logger as pinoLogger } from "../../lib/logger";
import { createId } from "../../lib/utils";
import { createSettingsManager } from "../app-configuration/metadata-manager";
import { ActiveTaxProvider } from "../taxes/active-tax-provider";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { GetProvidersConfigurationService } from "./get-providers-configuration.service";
import { ProvidersConfig } from "./providers-config";
import {
  createProviderInstanceInputSchema,
  deleteProviderInstanceInputSchema,
  updateProviderInstanceInputSchema,
} from "./providers-config-input-schema";
import { TaxProvidersConfigurator } from "./providers-configurator";

export const providersConfigurationRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("providersConfigurationRouter.fetch called");

    return new GetProvidersConfigurationService({
      apiClient: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getConfiguration();
  }),
  update: protectedClientProcedure
    .input(updateProviderInstanceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.info(input, "providersConfigurationRouter.update called with input:");

      const currentProviders = await new GetProvidersConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }).getConfiguration();

      const provider = currentProviders.find((provider) => provider.id === input.id);

      if (provider) {
        const taxProvider = new ActiveTaxProvider(provider);
        const validation = await taxProvider.validate();

        if (validation && !validation.ok) {
          logger.error(validation.error, "External validation failed.");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error,
          });
        }
      }

      logger.info(currentProviders, "Fetched current providers:");

      const taxProvidersConfigurator = new TaxProvidersConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const nextProviders: ProvidersConfig = currentProviders.map((provider) => {
        if (provider.id === input.id) {
          return {
            ...input.provider,
            id: input.id,
          };
        }

        return provider;
      });

      logger.info(nextProviders, "Will update providers with the following value:");

      await taxProvidersConfigurator.setConfig(nextProviders);

      return null;
    }),
  delete: protectedClientProcedure
    .input(deleteProviderInstanceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.info(input, "providersConfigurationRouter.delete called with input:");

      const currentProviders = await new GetProvidersConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }).getConfiguration();

      logger.info(currentProviders, "Fetched current providers:");

      const taxProvidersConfigurator = new TaxProvidersConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const nextProviders: ProvidersConfig = currentProviders.filter(
        (provider) => provider.id !== input.id
      );

      logger.info(nextProviders, "Will update providers with the following value:");

      await taxProvidersConfigurator.setConfig(nextProviders);

      return null;
    }),
  create: protectedClientProcedure
    .input(createProviderInstanceInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });
      logger.info(input, "providersConfigurationRouter.create called with input:");

      const currentProviders = await new GetProvidersConfigurationService({
        apiClient: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }).getConfiguration();

      logger.info(currentProviders, "Fetched current providers:");

      const taxProvidersConfigurator = new TaxProvidersConfigurator(
        createSettingsManager(ctx.apiClient),
        ctx.saleorApiUrl
      );

      const id = createId();
      const provider = { ...input.provider, id };
      const nextProviders: ProvidersConfig = [...currentProviders, provider];

      if (provider) {
        const taxProvider = new ActiveTaxProvider(provider);
        const validation = await taxProvider.validate();

        if (validation && !validation.ok) {
          logger.error(validation.error, "External validation failed.");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error,
          });
        }
      }

      logger.info(nextProviders, "Will update providers with the following value:");

      await taxProvidersConfigurator.setConfig(nextProviders);

      return { id };
    }),
});
