import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { AvataxClientTaxCodeService } from "@/modules/avatax/avatax-client-tax-code.service";
import { AvataxConnectionRepository } from "@/modules/avatax/configuration/avatax-connection-repository";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { createLogger } from "../../../logger";
import { protectedClientProcedure } from "../../trpc/protected-client-procedure";
import { router } from "../../trpc/trpc-server";
import { AvataxClient } from "../avatax-client";
import { AvataxSdkClientFactory } from "../avatax-sdk-client-factory";
import { AvataxConnectionService } from "../configuration/avatax-connection.service";
import { AvataxTaxCodesService } from "./avatax-tax-codes.service";

const getAllForIdSchema = z.object({
  connectionId: z.string(),
  filter: z.string().nullable(),
  uniqueKey: z.string(),
});

// TODO: Add test, but create dependency injection first, so services can be injected in ctx
export const avataxTaxCodesRouter = router({
  getAllForId: protectedClientProcedure.input(getAllForIdSchema).query(async ({ ctx, input }) => {
    const logger = createLogger("avataxTaxCodesRouter.getAllForId");

    logger.info("Called route", {
      connectionId: input.connectionId,
      filter: input.filter,
    });

    const connectionService = new AvataxConnectionService(
      new AvataxConnectionRepository(
        new CrudSettingsManager({
          metadataManager: createSettingsManager(ctx.apiClient, ctx.appId, metadataCache),
          saleorApiUrl: ctx.saleorApiUrl,
          metadataKey: TAX_PROVIDER_KEY,
        }),
      ),
    );

    const connection = await connectionService.getById(input.connectionId).catch((error) => {
      logger.error("Failed to resolve connection from settings", { error: error });

      throw new TRPCError({
        message: "Failed to resolve configuration, please try again",
        code: "INTERNAL_SERVER_ERROR",
      });
    });

    logger.info("Resolved configuration connection from settings", {
      connectionName: connection.config.name,
    });

    const taxCodesService = new AvataxTaxCodesService(
      new AvataxClient(new AvataxSdkClientFactory().createClient(connection.config)),
    );

    logger.debug("Returning tax codes");

    return taxCodesService.getAllFiltered({ filter: input.filter }).catch((error) => {
      logger.error("Failed to fetch tax codes from AvaTax", { error: error });

      if (error instanceof AvataxClientTaxCodeService.ForbiddenAccessError) {
        throw new TRPCError({
          code: "FORBIDDEN",
          cause: "AvaTax PermissionRequired",
          message:
            'AvaTax returned "Not Permitted" error. Verify your license permissions with Avalara support',
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch tax codes from AvaTax",
      });
    });
  }),
});
