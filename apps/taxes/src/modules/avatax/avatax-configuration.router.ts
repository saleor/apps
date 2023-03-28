import { z } from "zod";
import { logger as pinoLogger } from "../../lib/logger";
import { isObfuscated } from "../../lib/utils";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { avataxConfigSchema, obfuscateAvataxConfig } from "./avatax-config";
import { AvataxConfigurationService } from "./avatax-configuration.service";

const getInputSchema = z.object({
  id: z.string(),
});

const deleteInputSchema = z.object({
  id: z.string(),
});

const patchInputSchema = z.object({
  id: z.string(),
  value: avataxConfigSchema.partial().transform((c) => {
    const { username, password, ...config } = c ?? {};
    return {
      ...config,
      ...(username && !isObfuscated(username) && { username }),
      ...(password && !isObfuscated(password) && { password }),
    };
  }),
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

    logger.info({ input }, "avataxConfigurationRouter.get called with:");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.get(input.id);

    logger.info({ result }, "avataxConfigurationRouter.get finished");

    return { ...result, config: obfuscateAvataxConfig(result.config) };
  }),
  post: protectedClientProcedure.input(postInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.post",
    });

    logger.info({ input }, "avataxConfigurationRouter.post called with:");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.post(input.value);

    logger.info({ result }, "avataxConfigurationRouter.post finished");

    return result;
  }),
  delete: protectedClientProcedure.input(deleteInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.delete",
    });

    logger.info({ input }, "avataxConfigurationRouter.delete called with:");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.delete(input.id);

    logger.info({ result }, "avataxConfigurationRouter.delete finished");

    return result;
  }),
  patch: protectedClientProcedure.input(patchInputSchema).mutation(async ({ ctx, input }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.patch",
    });

    logger.info({ input }, "avataxConfigurationRouter.patch called with:");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new AvataxConfigurationService(apiClient, saleorApiUrl);

    const result = await avataxConfigurationService.patch(input.id, input.value);

    logger.info({ result }, "avataxConfigurationRouter.patch finished");

    return result;
  }),
});
