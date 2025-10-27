import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPool } from "@/lib/database";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";
import { PayPalPartnerReferralsApiFactory } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api-factory";
import { createPayPalMerchantId } from "@/modules/paypal/paypal-merchant-id";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";

/**
 * tRPC Handler for refreshing merchant status from PayPal
 * Checks seller status and updates payment method readiness
 */
export class RefreshMerchantStatusTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          trackingId: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.saleorApiUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing saleorApiUrl in request",
          });
        }

        if (!ctx.appToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing app authentication token",
          });
        }

        if (!ctx.appId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing appId in request",
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

          // Get existing onboarding record
          const recordResult = await repository.getByTrackingId(saleorApiUrl.value, input.trackingId);

          if (recordResult.isErr()) {
            captureException(recordResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve merchant record",
            });
          }

          if (!recordResult.value) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Merchant onboarding not found",
            });
          }

          const record = recordResult.value;

          // Check if merchant has completed onboarding
          if (!record.paypalMerchantId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Merchant has not completed onboarding yet",
            });
          }

          // Get PayPal configuration
          const metadataManager = PayPalMultiConfigMetadataManager.createFromAuthData({
            saleorApiUrl: saleorApiUrl.value,
            token: ctx.appToken,
            appId: ctx.appId,
          });

          const configResult = await metadataManager.getRootConfig();
          if (configResult.isErr()) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to load PayPal configuration",
            });
          }

          const rootConfig = configResult.value;
          const configIds = Object.keys(rootConfig.paypalConfigsById);
          if (configIds.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No PayPal configuration found",
            });
          }

          const paypalConfig = rootConfig.paypalConfigsById[configIds[0]];

          // Create Partner Referrals API client
          const apiFactory = PayPalPartnerReferralsApiFactory.create();
          const referralsApi = apiFactory.create({
            clientId: paypalConfig.clientId,
            clientSecret: paypalConfig.clientSecret,
            env: paypalConfig.environment,
          });

          // Check payment method readiness
          const merchantId = createPayPalMerchantId(record.paypalMerchantId);
          const readinessResult = await referralsApi.checkPaymentMethodReadiness(merchantId);

          if (readinessResult.isErr()) {
            // Update with error
            await repository.update(saleorApiUrl.value, input.trackingId, {
              lastStatusCheck: new Date(),
              statusCheckError: readinessResult.error.message,
            });

            captureException(readinessResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to check seller status: ${readinessResult.error.message}`,
            });
          }

          const readiness = readinessResult.value;

          // Update onboarding record with readiness info
          const updateResult = await repository.updatePaymentMethodReadiness(
            saleorApiUrl.value,
            input.trackingId,
            readiness
          );

          if (updateResult.isErr()) {
            captureException(updateResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update merchant status",
            });
          }

          // Determine onboarding status
          let onboardingStatus = record.onboardingStatus;
          if (readiness.primaryEmailConfirmed && readiness.paymentsReceivable && readiness.oauthIntegrated) {
            onboardingStatus = "COMPLETED";
          } else {
            onboardingStatus = "IN_PROGRESS";
          }

          // Update onboarding status if changed
          if (onboardingStatus !== record.onboardingStatus) {
            await repository.update(saleorApiUrl.value, input.trackingId, {
              onboardingStatus,
              onboardingCompletedAt: onboardingStatus === "COMPLETED" ? new Date() : undefined,
            });
          }

          return {
            success: true,
            readiness,
            onboardingStatus,
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
