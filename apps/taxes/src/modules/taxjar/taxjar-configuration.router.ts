import { z } from "zod";
import { logger as pinoLogger } from "../../lib/logger";
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
    const { apiKey, ...config } = c ?? {};
    return {
      ...config,
      ...(apiKey && !isObfuscated(apiKey) && { apiKey }),
    };
  }),
});

const postInputSchema = z.object({
  value: taxJarConfigSchema,
});

export const taxjarConfigurationRouter = router({
  get: protectedClientProcedure.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "taxjarConfigurationRouter.get",
    });

    logger.info("taxjarConfigurationRouter.get called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.get(input.id);

    logger.info({ result }, "taxjarConfigurationRouter.get finished");

    return { ...result, config: obfuscateTaxJarConfig(result.config) };
  }),
  post: protectedClientProcedure.input(postInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "taxjarConfigurationRouter.post",
    });

    logger.info("taxjarConfigurationRouter.post called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.post(input.value);

    logger.info({ result }, "taxjarConfigurationRouter.post finished");

    return result;
  }),
  delete: protectedClientProcedure.input(deleteInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "taxjarConfigurationRouter.delete",
    });

    logger.info("taxjarConfigurationRouter.delete called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.delete(input.id);

    logger.info({ result }, "taxjarConfigurationRouter.delete finished");

    return result;
  }),
  patch: protectedClientProcedure.input(patchInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "taxjarConfigurationRouter.patch",
    });

    logger.info("taxjarConfigurationRouter.patch called");

    const { apiClient, saleorApiUrl } = ctx;
    const taxjarConfigurationService = new TaxJarConfigurationService(apiClient, saleorApiUrl);

    const result = await taxjarConfigurationService.patch(input.id, input.value);

    logger.info({ result }, "taxjarConfigurationRouter.patch finished");

    return result;
  }),
});
