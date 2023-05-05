import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { createLogger } from "@saleor/apps-shared";
import { ShopInfoFetcher } from "./shop-info-fetcher";

export const shopInfoRouter = router({
  fetchShopAddress: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("shopInfoRouter.fetchShopAddress called");

    return new ShopInfoFetcher(ctx.apiClient).fetchShopInfo();
  }),
});
