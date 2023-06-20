import { createLogger } from "../../lib/logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { TaxClassesFetcher } from "./tax-classes-fetcher";

export const taxClassesRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "taxClassesRouter.getAll",
    });

    logger.debug("getAll called");

    const taxClassesFetcher = new TaxClassesFetcher(ctx.apiClient);

    logger.debug("Returning tax classes");

    return taxClassesFetcher.fetch();
  }),
});
