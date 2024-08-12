import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { TaxClassesFetcher } from "./tax-classes-fetcher";
import { createLogger } from "../../logger";
import { TRPCError } from "@trpc/server";

export const taxClassesRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger("taxClassesRouter.getAll");

    logger.info("Route called");

    const taxClassesFetcher = new TaxClassesFetcher(ctx.apiClient);

    logger.debug("Returning tax classes");

    return taxClassesFetcher.fetch().catch((err) => {
      logger.error("Failed to fetch tax classes", { error: err });

      // TODO: Map errors from Saleor and return proper response
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch tax classes",
      });
    });
  }),
});
