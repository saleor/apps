import { logger as pinoLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { TaxProvidersConfigurationService } from "./providers-configuration-service";

export const providersConfigurationRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = pinoLogger.child({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("providersConfigurationRouter.fetch called");

    return new TaxProvidersConfigurationService(ctx.apiClient, ctx.saleorApiUrl).getAll();
  }),
});
