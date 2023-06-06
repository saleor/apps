import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { PublicTaxProvidersConfigurationService } from "./public-providers-configuration-service";

export const providersConfigurationRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger({
      location: "providersConfigurationRouter.getAll",
    });

    const items = await new PublicTaxProvidersConfigurationService(
      ctx.apiClient,
      ctx.saleorApiUrl
    ).getAll();

    logger.info("Returning tax providers configuration");

    return items;
  }),
});
