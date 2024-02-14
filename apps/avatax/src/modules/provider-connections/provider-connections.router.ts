import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { PublicProviderConnectionsService } from "./public-provider-connections.service";
import { createLogger } from "../../logger";

export const providerConnectionsRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger("providerConnectionsRouter.getAll");

    const items = await new PublicProviderConnectionsService({
      appId: ctx.appId!,
      client: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    }).getAll();

    logger.info("Returning tax providers configuration");

    return items;
  }),
});
