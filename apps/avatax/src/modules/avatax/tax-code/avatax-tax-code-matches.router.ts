import { AvataxTaxCodeMatchesService } from "./avatax-tax-code-matches.service";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";
import {
  AvataxTaxCodeMatchRepository,
  avataxTaxCodeMatchSchema,
} from "./avatax-tax-code-match-repository";
import { createLogger } from "../../../logger";
import { createInstrumentedGraphqlClient } from "../../../lib/create-instrumented-graphql-client";
import { createSettingsManager } from "../../app/metadata-manager";
import { metadataCache } from "../../../lib/app-metadata-cache";
import { AvataxCalculateTaxesPayloadService } from "../calculate-taxes/avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesPayloadTransformer } from "../calculate-taxes/avatax-calculate-taxes-payload-transformer";

const protectedWithAvataxTaxCodeMatchesService = protectedClientProcedure.use(({ next, ctx }) => {
  const client = createInstrumentedGraphqlClient({
    saleorApiUrl: ctx.saleorApiUrl,
    token: ctx.token,
  });
  const settingsManager = createSettingsManager(client, ctx.appId, metadataCache);

  const taxCodeMatchRepository = new AvataxTaxCodeMatchRepository(
    settingsManager,
    ctx.saleorApiUrl,
  );

  return next({
    ctx: {
      taxCodeMatchesService: new AvataxTaxCodeMatchesService(taxCodeMatchRepository),
    },
  });
});

export const avataxTaxCodeMatchesRouter = router({
  getAll: protectedWithAvataxTaxCodeMatchesService.query(async ({ ctx }) => {
    const logger = createLogger("avataxTaxCodeMatchesRouter.fetch");

    logger.info("Returning tax code matches");

    return ctx.taxCodeMatchesService.getAll();
  }),
  upsert: protectedWithAvataxTaxCodeMatchesService
    .input(avataxTaxCodeMatchSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("avataxTaxCodeMatchesRouter.upsert");

      logger.info("Upserting tax code match");

      return ctx.taxCodeMatchesService.upsert(input);
    }),
});
