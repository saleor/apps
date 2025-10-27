import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPool } from "@/lib/database";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { createPayPalMerchantId } from "@/modules/paypal/paypal-merchant-id";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";

/**
 * tRPC Handler for updating merchant's PayPal merchant ID
 * Called after merchant returns from PayPal ISU
 */
export class UpdateMerchantIdTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          trackingId: z.string().min(1),
          paypalMerchantId: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
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

          // Validate merchant exists
          const existingResult = await repository.getByTrackingId(
            saleorApiUrl.value,
            input.trackingId
          );

          if (existingResult.isErr()) {
            captureException(existingResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve merchant record",
            });
          }

          if (!existingResult.value) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Merchant onboarding record not found",
            });
          }

          // Create branded PayPal merchant ID
          const merchantId = createPayPalMerchantId(input.paypalMerchantId);

          // Update merchant record
          const updateResult = await repository.update(saleorApiUrl.value, input.trackingId, {
            paypalMerchantId: merchantId,
            onboardingStatus: "IN_PROGRESS", // Will be COMPLETED after status refresh
            onboardingStartedAt: existingResult.value.onboardingStartedAt || new Date(),
          });

          if (updateResult.isErr()) {
            captureException(updateResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update merchant ID",
            });
          }

          return {
            success: true,
            message: "Merchant ID updated successfully",
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
