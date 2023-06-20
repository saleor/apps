import { router } from "../../trpc/trpc-server";

import { z } from "zod";
import { createLogger } from "../../../lib/logger";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { AvataxConnectionService } from "../configuration/avatax-connection.service";
import { AvataxTaxCodesService } from "./avatax-tax-codes.service";

const getAllForIdSchema = z.object({ connectionId: z.string() });

export const avataxTaxCodesRouter = router({
  getAllForId: protectedClientProcedure.input(getAllForIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger({
      name: "avataxTaxCodesRouter.getAllForId",
    });

    const connectionService = new AvataxConnectionService(
      ctx.apiClient,
      ctx.appId!,
      ctx.saleorApiUrl
    );

    const connection = await connectionService.getById(input.connectionId);
    const taxCodesService = new AvataxTaxCodesService(connection.config);

    logger.debug("Returning tax codes");

    return taxCodesService.getAll();
  }),
});
