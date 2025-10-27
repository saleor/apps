import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { getPool } from "@/lib/database";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";

/**
 * tRPC Handler for listing all merchant onboardings
 */
export class ListMerchantsTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
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

        const result = await repository.list(saleorApiUrl.value);

        if (result.isErr()) {
          captureException(result.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to list merchants",
          });
        }

        const merchants = result.value.map((record) => ({
          trackingId: record.trackingId,
          merchantEmail: record.merchantEmail,
          merchantCountry: record.merchantCountry,
          onboardingStatus: record.onboardingStatus,
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
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }));

        return {
          merchants,
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
