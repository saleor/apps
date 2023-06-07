import { z } from "zod";
import { createLogger } from "../../lib/logger";
import { isObfuscated } from "../../lib/utils";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { obfuscateTaxJarConfig, taxJarConfigSchema } from "./taxjar-config";
import { TaxJarConfigurationService } from "./taxjar-configuration.service";

const getInputSchema = z.object({
  id: z.string(),
});

const deleteInputSchema = z.object({
  id: z.string(),
});

const patchInputSchema = z.object({
  id: z.string(),
  value: taxJarConfigSchema.partial().transform((c) => {
    const { credentials, ...config } = c ?? {};
    const { apiKey } = credentials ?? {};

    return {
      ...config,
      credentials: {
        ...credentials,
        ...(apiKey && !isObfuscated(apiKey) && { apiKey }),
      },
    };
  }),
});

const postInputSchema = z.object({
  value: taxJarConfigSchema,
});

export const taxjarConfigurationRouter = router({
  get: protectedClientProcedure.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "taxjarConfigurationRouter.get",
    });

    logger.debug("taxjarConfigurationRouter.get called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.get(input.id);

    logger.info(`TaxJar configuration with an id: ${result.id} was successfully retrieved`);

    return result;
  }),
  post: protectedClientProcedure.input(postInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "taxjarConfigurationRouter.post",
    });

    logger.debug("Attempting to create configuration");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.post(input.value);

    logger.info("TaxJar configuration was successfully created");

    return result;
  }),
  delete: protectedClientProcedure.input(deleteInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "taxjarConfigurationRouter.delete",
    });

    logger.debug("Route delete called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.delete(input.id);

    logger.info(`TaxJar configuration with an id: ${input.id} was deleted`);
    return result;
  }),
  patch: protectedClientProcedure.input(patchInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "taxjarConfigurationRouter.patch",
    });

    logger.debug("Route patch called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.patch(input.id, input.value);

    logger.info(`TaxJar configuration with an id: ${input.id} was successfully updated`);
    return result;
  }),
});
