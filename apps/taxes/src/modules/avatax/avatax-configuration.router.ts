import { z } from "zod";
import { logger as pinoLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { avataxConfigSchema } from "./avatax-config";
import { AvataxConfigurationService } from "./avatax-configuration.service";

const getInputSchema = z.object({
  id: z.string(),
});

const deleteInputSchema = z.object({
  id: z.string(),
});

const patchInputSchema = z.object({
  id: z.string(),
  value: avataxConfigSchema.partial(),
});

const putInputSchema = z.object({
  id: z.string(),
  value: avataxConfigSchema,
});

const postInputSchema = z.object({
  value: avataxConfigSchema,
});

export const avataxConfigurationRouter = router({
  get: protectedClientProcedure.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.get",
    });

    logger.debug("avataxConfigurationRouter.get called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.get(input.id);

    logger.debug({ result }, "avataxConfigurationRouter.get finished");

    return result;
  }),
  post: protectedClientProcedure.input(postInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.post",
    });

    logger.debug("avataxConfigurationRouter.post called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.post(input.value);

    logger.debug({ result }, "avataxConfigurationRouter.post finished");

    return result;
  }),
  delete: protectedClientProcedure.input(deleteInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.delete",
    });

    logger.debug("avataxConfigurationRouter.delete called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.delete(input.id);

    logger.debug({ result }, "avataxConfigurationRouter.delete finished");

    return result;
  }),
  patch: protectedClientProcedure.input(patchInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.patch",
    });

    logger.debug("avataxConfigurationRouter.patch called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.patch(input.id, input.value);

    logger.debug({ result }, "avataxConfigurationRouter.patch finished");

    return result;
  }),
  put: protectedClientProcedure.input(putInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.put",
    });

    logger.debug("avataxConfigurationRouter.put called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.put(input.id, input.value);

    logger.debug({ result }, "avataxConfigurationRouter.put finished");

    return result;
  }),
});
