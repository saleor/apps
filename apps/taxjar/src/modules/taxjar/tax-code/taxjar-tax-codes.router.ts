import { router } from "../../trpc/trpc-server";

import { protectedClientProcedure } from "../../trpc/protected-client-procedure";

import { z } from "zod";
import { TaxJarConnectionService } from "../configuration/taxjar-connection.service";
import { TaxJarTaxCodesService } from "./taxjar-tax-codes.service";
import { createLogger } from "../../../logger";

const getAllForIdSchema = z.object({ connectionId: z.string() });

export const taxJarTaxCodesRouter = router({
  getAllForId: protectedClientProcedure.input(getAllForIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("taxjarTaxCodesRouter.getAllForId");

    const connectionService = new TaxJarConnectionService({
      appId: ctx.appId!,
      client: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const connection = await connectionService.getById(input.connectionId);
    const taxCodesService = new TaxJarTaxCodesService(connection.config);

    logger.debug("Returning tax codes");

    return taxCodesService.getAll();
  }),
});
