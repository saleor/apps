import { z } from "zod";
import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { avataxConfigSchema } from "./avatax-config";
import { PublicAvataxConfigurationService } from "./configuration/public-avatax-configuration.service";

const getInputSchema = z.object({
  id: z.string(),
});

const deleteInputSchema = z.object({
  id: z.string(),
});

const patchInputSchema = z.object({
  id: z.string(),
  value: avataxConfigSchema.deepPartial(),
});

const postInputSchema = z.object({
  value: avataxConfigSchema,
});

export const avataxConfigurationRouter = router({
  get: protectedClientProcedure.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "avataxConfigurationRouter.get",
    });

    logger.debug("Route get called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new PublicAvataxConfigurationService(
      apiClient,
      saleorApiUrl
    );

    const result = await avataxConfigurationService.get(input.id);

    logger.info(`Avatax configuration with an id: ${result.id} was successfully retrieved`);

    return result;
  }),
  post: protectedClientProcedure.input(postInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.post",
    });

    logger.debug("Attempting to create configuration");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new PublicAvataxConfigurationService(
      apiClient,
      saleorApiUrl
    );

    const result = await avataxConfigurationService.post(input.value);

    logger.info("Avatax configuration was successfully created");

    return result;
  }),
  delete: protectedClientProcedure.input(deleteInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.delete",
    });

    logger.debug("Route delete called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new PublicAvataxConfigurationService(
      apiClient,
      saleorApiUrl
    );

    const result = await avataxConfigurationService.delete(input.id);

    logger.info(`Avatax configuration with an id: ${input.id} was deleted`);

    return result;
  }),
  patch: protectedClientProcedure.input(patchInputSchema).mutation(async ({ ctx, input }) => {
    const logger = createLogger({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "avataxConfigurationRouter.patch",
    });

    logger.debug("Route patch called");

    const { apiClient, saleorApiUrl } = ctx;
    const avataxConfigurationService = new PublicAvataxConfigurationService(
      apiClient,
      saleorApiUrl
    );

    const result = await avataxConfigurationService.patch(input.id, input.value);

    logger.info(`Avatax configuration with an id: ${input.id} was successfully updated`);

    return result;
  }),
});
