import { createLogger } from "../../logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { ShopInfoFetcher } from "./shop-info-fetcher";

const logger = createLogger("shopInfoRouter");

export const shopInfoRouter = router({
  fetchShopAddress: protectedClientProcedure.query(async ({ ctx, input }) => {
    logger.debug("shopInfoRouter.fetchShopAddress called", {
      saleorApiUrl: ctx.saleorApiUrl,
    });

    return new ShopInfoFetcher(ctx.apiClient).fetchShopInfo();
  }),
});
