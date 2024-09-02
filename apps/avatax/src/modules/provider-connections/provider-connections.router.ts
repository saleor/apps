import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { AvataxObfuscator } from "@/modules/avatax/avatax-obfuscator";
import { AvataxConnectionService } from "@/modules/avatax/configuration/avatax-connection.service";
import { AvataxConnectionRepository } from "@/modules/avatax/configuration/avatax-connection-repository";
import { PublicAvataxConnectionService } from "@/modules/avatax/configuration/public-avatax-connection.service";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";

import { createLogger } from "../../logger";
import { protectedClientProcedure } from "../trpc/protected-client-procedure";
import { router } from "../trpc/trpc-server";
import {
  PublicProviderConnectionsService,
  TAX_PROVIDER_KEY,
} from "./public-provider-connections.service";

export const providerConnectionsRouter = router({
  getAll: protectedClientProcedure.query(async ({ ctx }) => {
    const logger = createLogger("providerConnectionsRouter.getAll");

    const items = await new PublicProviderConnectionsService(
      new PublicAvataxConnectionService(
        new AvataxConnectionService(
          new AvataxConnectionRepository(
            new CrudSettingsManager({
              saleorApiUrl: ctx.saleorApiUrl,
              metadataKey: TAX_PROVIDER_KEY,
              metadataManager: createSettingsManager(ctx.apiClient, ctx.appId, metadataCache),
            }),
          ),
        ),
        new AvataxObfuscator(),
      ),
    ).getAll();

    logger.info("Returning tax providers configuration");

    return items;
  }),
});
