import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { StripeFrontendConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";

export const getStripeConfigTrpcHandler = async ({
  configRepo,
  configId,
  saleorApiUrl,
  appId,
}: {
  configRepo: AppConfigRepo;
  configId: string;
  appId: string;
  saleorApiUrl: SaleorApiUrl;
}) => {
  const config = await configRepo.getStripeConfig({
    configId: configId,
    saleorApiUrl: saleorApiUrl,
    appId: appId,
  });

  if (config.isErr()) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "App failed to fetch config, please contact Saleor",
    });
  }

  if (!config.value) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Config not found",
    });
  }

  return StripeFrontendConfig.createFromStripeConfig(config.value);
};

/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  getStripeConfig: protectedClientProcedure
    .input(
      z.object({
        configId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const saleorApiUrl = SaleorApiUrl.create({ url: ctx.saleorApiUrl });

      /**
       * TODO: Extract such logic to be shared between handlers
       */
      if (saleorApiUrl.isErr()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Malformed request",
        });
      }

      return getStripeConfigTrpcHandler({
        configId: input.configId,
        saleorApiUrl: saleorApiUrl.value,
        appId: ctx.appId,
        configRepo: ctx.configRepo,
      });
    }),
});
