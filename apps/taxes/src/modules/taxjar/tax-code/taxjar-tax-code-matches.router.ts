import { createLogger } from "../../../lib/logger";
import { TaxJarTaxCodeMatchesService } from "./taxjar-tax-code-matches.service";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";
import { taxJarTaxCodeMatchSchema } from "./taxjar-tax-code-match-repository";

const protectedWithTaxJarTaxCodeMatchesService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      taxCodeMatchesService: new TaxJarTaxCodeMatchesService({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.appToken!,
        appId: ctx.appId!,
      }),
    },
  })
);

export const taxJarTaxCodeMatchesRouter = router({
  getAll: protectedWithTaxJarTaxCodeMatchesService.query(async ({ ctx }) => {
    const logger = createLogger({
      name: "taxjarTaxCodeMatchesRouter.fetch",
    });

    logger.info("Returning tax code matches");

    return ctx.taxCodeMatchesService.getAll();
  }),
  upsert: protectedWithTaxJarTaxCodeMatchesService
    .input(taxJarTaxCodeMatchSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        name: "taxjarTaxCodeMatchesRouter.upsert",
      });

      logger.info("Upserting tax code match");

      return ctx.taxCodeMatchesService.upsert(input);
    }),
});
