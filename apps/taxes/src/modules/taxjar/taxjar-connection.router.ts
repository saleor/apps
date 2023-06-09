import { z } from "zod";
import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { taxJarConfigSchema } from "./taxjar-connection-schema";
import { PublicTaxJarConnectionService } from "./configuration/public-taxjar-connection.service";

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
      ...ctx,
      connectionService: new PublicTaxJarConnectionService(
        ctx.apiClient,
        ctx.appId,
        ctx.saleorApiUrl
      ),
    },
  })
);

export const taxjarConnectionRouter = router({
  getById: protectedWithConfigurationService.input(getInputSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      location: "taxjarConnectionRouter.get",
    });

    logger.debug("taxjarConnectionRouter.get called");

    const taxJarConfigurationService = ctx.connectionService;

    const result = await taxJarConfigurationService.getById(input.id);

    logger.info(`TaxJar configuration with an id: ${result.id} was successfully retrieved`);

    return result;
  }),
  create: protectedWithConfigurationService
    .input(postInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        location: "taxjarConnectionRouter.post",
      });

      logger.debug("Attempting to create configuration");

      const taxJarConfigurationService = ctx.connectionService;

      const result = await taxJarConfigurationService.create(input.value);

      logger.info("TaxJar configuration was successfully created");

      return result;
    }),
  delete: protectedWithConfigurationService
    .input(deleteInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        location: "taxjarConnectionRouter.delete",
      });

      logger.debug("Route delete called");

      const taxJarConfigurationService = ctx.connectionService;

      const result = await taxJarConfigurationService.delete(input.id);

      logger.info(`TaxJar configuration with an id: ${input.id} was deleted`);
      return result;
    }),
  update: protectedWithConfigurationService
    .input(patchInputSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        location: "taxjarConnectionRouter.patch",
      });

      logger.debug({ input }, "Route patch called");

      const taxJarConfigurationService = ctx.connectionService;

      const result = await taxJarConfigurationService.update(input.id, input.value);

      logger.info(`TaxJar configuration with an id: ${input.id} was successfully updated`);
      return result;
    }),
});
