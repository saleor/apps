import { TRPCError } from "@trpc/server";

import { createLogger } from "../../logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import { TaxClassesFetcher } from "./tax-classes-fetcher";

export const taxClassesRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx, input }) => {
    const logger = createLogger("taxClassesRouter.getAll");

    logger.info("Route called");

    const taxClassesFetcher = new TaxClassesFetcher(ctx.apiClient);

    logger.debug("Returning tax classes");

    return taxClassesFetcher.fetch().catch((error) => {
      logger.error("Failed to fetch tax classes", { error: error });

      // TODO: Map errors from Saleor and return proper response
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch tax classes",
      });
    });
  }),
});
