import { createSaleorApiUrl, SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { Result } from "neverthrow";
import { z } from "zod";

import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class RemoveConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  private async getRootConfigOrThrow({
    configRepo,
    appId,
    saleorApiUrl,
  }: {
    configRepo: AppConfigRepo;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const rootConfig = await configRepo.getRootConfig({
      saleorApiUrl: saleorApiUrl,
      appId: appId,
    });

    if (rootConfig.isErr()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove configuration. Please try again.",
      });
    }

    if (rootConfig.value === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Config not found, please refresh the page and try again.",
      });
    }

    return rootConfig.value;
  }

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          configId: z.string().uuid(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        if (!ctx.appUrl) {
          captureException(new BaseError("Missing appUrl in TRPC request"));

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong, please contact support.",
          });
        }

        const rootConfig = await this.getRootConfigOrThrow({
          configRepo: ctx.configRepo,
          appId: ctx.appId,
          saleorApiUrl: saleorApiUrl,
        });

        const configToRemove = rootConfig.getConfigById(input.configId);
        const channelsToUnbind = rootConfig.getChannelsBoundToGivenConfig(input.configId);

        if (!configToRemove) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found, please refresh the page and try again.",
          });
        }

        /**
         * TODO: To make it more reliable, we can use transact writes in DynamoDB, but even if this partially fails,
         * next operations should fix invalid state
         */
        const unbindingResults = Result.combine(
          await Promise.all(
            channelsToUnbind.map((id) =>
              ctx.configRepo.updateMapping(
                {
                  saleorApiUrl: saleorApiUrl,
                  appId: ctx.appId,
                },
                {
                  configId: null,
                  channelId: id,
                },
              ),
            ),
          ),
        );

        if (unbindingResults.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update channel config mapping. Please try again.",
          });
        }

        const removalResult = await ctx.configRepo.removeConfig(
          {
            saleorApiUrl: saleorApiUrl,
            appId: ctx.appId,
          },
          {
            configId: input.configId,
          },
        );

        if (removalResult.isErr()) {
          captureException(removalResult.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove configuration. Please try again.",
          });
        }
      });
  }
}
