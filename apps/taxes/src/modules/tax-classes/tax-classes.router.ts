import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { TaxClassesFetcher } from "./tax-classes-fetcher";
import { createLogger } from "../../logger";

export const taxClassesRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger("taxClassesRouter.getAll");

    logger.debug("getAll called");

    const taxClassesFetcher = new TaxClassesFetcher(ctx.apiClient);

    logger.debug("Returning tax classes");

    return taxClassesFetcher.fetch();
  }),
});
