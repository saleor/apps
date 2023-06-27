import { z } from "zod";
import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { avataxConfigSchema } from "./avatax-connection-schema";
import { PublicAvataxConnectionService } from "./configuration/public-avatax-connection.service";

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

const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      connectionService: new PublicAvataxConnectionService(
        ctx.apiClient,
        ctx.appId!,
        ctx.saleorApiUrl
      ),
    },
  })
);

export const avataxConnectionRouter = router({
  verifyConnections: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = createLogger({
      name: "avataxConnectionRouter.verifyConnections",
    });

    logger.debug("Route verifyConnections called");

    await ctx.connectionService.verifyConnections();

    logger.info("Avatax connections were successfully verified");

    return { ok: true };
  }),
  getById: protectedWithConfigurationService.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "avataxConnectionRouter.get",
    });

    logger.debug("Route get called");

    const result = await ctx.connectionService.getById(input.id);

    logger.info(`Avatax configuration with an id: ${result.id} was successfully retrieved`);

    return result;
  }),
  create: protectedWithConfigurationService
    .input(postInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        saleorApiUrl: ctx.saleorApiUrl,
        procedure: "avataxConnectionRouter.post",
      });

      logger.debug("Attempting to create configuration");

      const result = await ctx.connectionService.create(input.value);

      logger.info("Avatax configuration was successfully created");

      return result;
    }),
  delete: protectedWithConfigurationService
    .input(deleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        saleorApiUrl: ctx.saleorApiUrl,
        procedure: "avataxConnectionRouter.delete",
      });

      logger.debug("Route delete called");

      const result = await ctx.connectionService.delete(input.id);

      logger.info(`Avatax configuration with an id: ${input.id} was deleted`);

      return result;
    }),
  update: protectedWithConfigurationService
    .input(patchInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        saleorApiUrl: ctx.saleorApiUrl,
        procedure: "avataxConnectionRouter.patch",
      });

      logger.debug("Route patch called");

      const result = await ctx.connectionService.update(input.id, input.value);

      logger.info(`Avatax configuration with an id: ${input.id} was successfully updated`);

      return result;
    }),
});
