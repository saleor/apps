import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPool } from "@/lib/database";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";

/**
 * tRPC Handler for getting merchant onboarding status
 */
export class GetMerchantStatusTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          trackingId: z.string().min(1).optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        if (!ctx.saleorApiUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing saleorApiUrl in request",
          });
        }

        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);
        if (saleorApiUrl.isErr()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Malformed saleorApiUrl",
          });
        }

        try {
          const pool = getPool();
          const repository = PostgresMerchantOnboardingRepository.create(pool);

          // If trackingId is provided, use it for backwards compatibility
          // Otherwise, get by saleorApiUrl only (returns the most recent record)
          const result = input.trackingId
            ? await repository.getByTrackingId(saleorApiUrl.value, input.trackingId)
            : await repository.getBySaleorApiUrl(saleorApiUrl.value);

          if (result.isErr()) {
            captureException(result.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve merchant status",
            });
          }

          if (!result.value) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Merchant onboarding not found",
            });
          }

          const record = result.value;

          return {
            trackingId: record.trackingId,
            merchantEmail: record.merchantEmail,
            onboardingStatus: record.onboardingStatus,
            actionUrl: record.actionUrl,
            primaryEmailConfirmed: record.primaryEmailConfirmed,
            paymentsReceivable: record.paymentsReceivable,
            oauthIntegrated: record.oauthIntegrated,
            paymentMethods: {
              paypalButtons: record.paypalButtonsEnabled,
              advancedCardProcessing: record.acdcEnabled,
              applePay: record.applePayEnabled,
              googlePay: record.googlePayEnabled,
              vaulting: record.vaultingEnabled,
            },
            lastStatusCheck: record.lastStatusCheck,
            statusCheckError: record.statusCheckError,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }

          captureException(error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          });
        }
      });
  }
}
