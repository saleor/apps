import { logger as pinoLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { PublicTaxProvidersConfigurationService } from "./public-providers-configuration-service";

export const providersConfigurationRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = pinoLogger.child({
      saleorApiUrl: ctx.saleorApiUrl,
      procedure: "providersConfigurationRouter.getAll",
    });

    logger.debug("providersConfigurationRouter.fetch called");

    return new PublicTaxProvidersConfigurationService(ctx.apiClient, ctx.saleorApiUrl).getAll();
  }),
});
