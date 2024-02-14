import { z } from "zod";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { taxJarConfigSchema } from "./taxjar-connection-schema";
import { PublicTaxJarConnectionService } from "./configuration/public-taxjar-connection.service";
import { createLogger } from "../../logger";

const getInputSchema = z.object({
  id: z.string(),
});

const deleteInputSchema = z.object({
  id: z.string(),
});

const patchInputSchema = z.object({
  id: z.string(),
  value: taxJarConfigSchema.deepPartial(),
});

const postInputSchema = z.object({
  value: taxJarConfigSchema,
});

const protectedWithConfigurationService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      connectionService: new PublicTaxJarConnectionService({
        appId: ctx.appId!,
        client: ctx.apiClient,
        saleorApiUrl: ctx.saleorApiUrl,
      }),
    },
  }),
);

export const taxjarConnectionRouter = router({
  verifyConnections: protectedWithConfigurationService.query(async ({ ctx }) => {
    const logger = createLogger("taxjarConnectionRouter.verifyConnections");

    logger.debug("Route verifyConnections called");

    await ctx.connectionService.verifyConnections();

    logger.info("TaxJar connections were successfully verified");

    return { ok: true };
  }),
  getById: protectedWithConfigurationService.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("taxjarConnectionRouter.get");

    logger.debug("taxjarConnectionRouter.get called");

    const result = await ctx.connectionService.getById(input.id);

    logger.info(`TaxJar configuration with an id: ${result.id} was successfully retrieved`);

    return result;
  }),
  create: protectedWithConfigurationService
    .input(postInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("taxjarConnectionRouter.post");

      logger.debug("Attempting to create configuration");

      const result = await ctx.connectionService.create(input.value);

      logger.info("TaxJar configuration was successfully created");

      return result;
    }),
  delete: protectedWithConfigurationService
    .input(deleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("taxjarConnectionRouter.delete");

      logger.debug("Route delete called");

      const result = await ctx.connectionService.delete(input.id);

      logger.info(`TaxJar configuration with an id: ${input.id} was deleted`);
      return result;
    }),
  update: protectedWithConfigurationService
    .input(patchInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("taxjarConnectionRouter.patch");

      logger.debug("Route update called");

      const result = await ctx.connectionService.update(input.id, input.value);

      logger.info(`TaxJar configuration with an id: ${input.id} was successfully updated`);
      return result;
    }),
});
