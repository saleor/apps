import { TRPCError } from "@trpc/server";

import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { StripeFrontendConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

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
