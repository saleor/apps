import { createLogger } from "@saleor/apps-shared";
import { router } from "../trpc/trpc-server";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";

export const appConfigurationRouter = router({
  featureFlags: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger({ saleorApiUrl: ctx.saleorApiUrl });

    logger.debug("sendgridConfigurationRouter.fetch called");
    return ctx.sendgridConfigurationService.getConfigurationRoot();
  }),
});
