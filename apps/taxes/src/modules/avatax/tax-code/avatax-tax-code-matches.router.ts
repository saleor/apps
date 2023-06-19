import { createLogger } from "../../../lib/logger";
import { AvataxTaxCodeMatchesService } from "./avatax-tax-code-matches.service";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";
import { avataxTaxCodeMatchSchema } from "./avatax-tax-code-match-repository";

const protectedWithAvataxTaxCodeMatchesService = protectedClientProcedure.use(({ next, ctx }) =>
  next({
    ctx: {
      taxCodeMatchesService: new AvataxTaxCodeMatchesService({
        saleorApiUrl: ctx.saleorApiUrl,
        token: ctx.token!,
        appId: ctx.appId!,
      }),
    },
  })
);

export const avataxTaxCodeMatchesRouter = router({
  getAll: protectedWithAvataxTaxCodeMatchesService.query(async ({ ctx }) => {
    const logger = createLogger({
      name: "avataxTaxCodeMatchesRouter.fetch",
    });

    logger.info("Returning channel configuration");

    return ctx.taxCodeMatchesService.getAll();
  }),
  upsert: protectedWithAvataxTaxCodeMatchesService
    .input(avataxTaxCodeMatchSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger({
        name: "avataxTaxCodeMatchesRouter.updateMany",
      });

      logger.info("Updating channel configuration");

      return ctx.taxCodeMatchesService.upsert(input);
    }),
});
