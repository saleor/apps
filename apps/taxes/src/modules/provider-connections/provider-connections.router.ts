import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { PublicProviderConnectionsService } from "./public-provider-connections.service";

export const providerConnectionsRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger({
      location: "providerConnectionsRouter.getAll",
    });

    const items = await new PublicProviderConnectionsService(
      ctx.apiClient,
      ctx.saleorApiUrl
    ).getAll();

    logger.info("Returning tax providers configuration");

    return items;
  }),
});
