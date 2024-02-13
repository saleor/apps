import { router } from "../../trpc/trpc-server";

import { z } from "zod";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { AvataxConnectionService } from "../configuration/avatax-connection.service";
import { AvataxTaxCodesService } from "./avatax-tax-codes.service";
import { createLogger } from "../../../logger";

const getAllForIdSchema = z.object({
  connectionId: z.string(),
  filter: z.string().nullable(),
  uniqueKey: z.string(),
});

export const avataxTaxCodesRouter = router({
  getAllForId: protectedClientProcedure.input(getAllForIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("avataxTaxCodesRouter.getAllForId");

    const connectionService = new AvataxConnectionService({
      appId: ctx.appId!,
      client: ctx.apiClient,
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const connection = await connectionService.getById(input.connectionId);
    const taxCodesService = new AvataxTaxCodesService(connection.config);

    logger.debug("Returning tax codes");

    return taxCodesService.getAllFiltered({ filter: input.filter });
  }),
});
